import React, { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { storage } from '../../lib/supabase';
import { checkRateLimit, recordUpload } from '../../utils/rateLimiter';
import './ImageUploader.css';

const ImageUploader = ({ images = [], onChange, productId = null, maxSizeMB = 20 }) => {
  const { currentAdmin } = useAdmin();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // Разрешенные типы файлов
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Валидация файла
  const validateFile = (file) => {
    // Проверка типа
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Неподдерживаемый формат. Разрешены: JPG, JPEG, PNG, WEBP`
      };
    }

    // Проверка размера
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Файл слишком большой. Максимальный размер: ${maxSizeMB} МБ`
      };
    }

    return { valid: true };
  };

  // Загрузка одного файла
  const uploadFile = async (file) => {
    // Проверка авторизации администратора
    if (!currentAdmin) {
      throw new Error('Требуется авторизация администратора для загрузки файлов');
    }

    // Проверка rate limit
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      const resetTime = new Date(rateLimitCheck.resetAt).toLocaleTimeString('ru-RU');
      throw new Error(`${rateLimitCheck.error} Повторите попытку после ${resetTime}`);
    }

    // Валидация файла
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Дополнительная валидация: проверка реального типа файла по сигнатуре
    const fileTypeValid = await validateFileType(file);
    if (!fileTypeValid.valid) {
      throw new Error(fileTypeValid.error);
    }

    // Если productId не указан, создаем временный URL для превью
    if (!productId) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            url: e.target.result,
            isTemporary: true,
            file: file
          });
        };
        reader.readAsDataURL(file);
      });
    }

    // Регистрируем загрузку для rate limiting
    recordUpload();

    // Загружаем в Supabase Storage
    // Преобразуем productId в строку для безопасности
    const productIdStr = productId ? String(productId) : `temp_${Date.now()}`;
    const fileExt = file.name.split('.').pop();
    const fileName = `${productIdStr}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { url, error } = await storage.uploadProductImage(file, fileName, currentAdmin);
    
    if (error) {
      const errorMessage = error.message || 'Неизвестная ошибка при загрузке файла';
      throw new Error(`Ошибка загрузки: ${errorMessage}`);
    }

    return {
      url,
      path: fileName,
      isTemporary: false
    };
  };

  // Валидация типа файла по сигнатуре (magic bytes)
  const validateFileType = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const bytes = new Uint8Array(arrayBuffer.slice(0, 12));
        
        // Проверка сигнатур различных форматов изображений
        const signatures = {
          jpeg: [[0xFF, 0xD8, 0xFF]],
          png: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
          webp: [[0x52, 0x49, 0x46, 0x46], [0x57, 0x45, 0x42, 0x50]] // RIFF...WEBP
        };

        let isValid = false;
        let detectedType = null;

        // Проверка JPEG
        if (bytes[0] === signatures.jpeg[0][0] && 
            bytes[1] === signatures.jpeg[0][1] && 
            bytes[2] === signatures.jpeg[0][2]) {
          isValid = true;
          detectedType = 'jpeg';
        }
        // Проверка PNG
        else if (signatures.png[0].every((byte, index) => bytes[index] === byte)) {
          isValid = true;
          detectedType = 'png';
        }
        // Проверка WEBP
        else if (signatures.webp[0].every((byte, index) => bytes[index] === byte) &&
                 bytes[8] === signatures.webp[1][0] &&
                 bytes[9] === signatures.webp[1][1] &&
                 bytes[10] === signatures.webp[1][2] &&
                 bytes[11] === signatures.webp[1][3]) {
          isValid = true;
          detectedType = 'webp';
        }

        if (!isValid) {
          resolve({
            valid: false,
            error: 'Файл не является изображением или имеет неподдерживаемый формат'
          });
        } else {
          // Проверяем соответствие MIME-типа
          const expectedMime = {
            jpeg: ['image/jpeg', 'image/jpg'],
            png: ['image/png'],
            webp: ['image/webp']
          };

          if (!expectedMime[detectedType].includes(file.type)) {
            resolve({
              valid: false,
              error: 'MIME-тип файла не соответствует его содержимому'
            });
          } else {
            resolve({ valid: true });
          }
        }
      };
      reader.onerror = () => {
        resolve({
          valid: false,
          error: 'Ошибка при чтении файла'
        });
      };
      reader.readAsArrayBuffer(file.slice(0, 12));
    });
  };

  // Обработка выбора файлов
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const newImages = [...images];
    const progress = {};

    try {
      // Валидация всех файлов перед загрузкой
      for (const file of files) {
        const validation = validateFile(file);
        if (!validation.valid) {
          alert(validation.error);
          setUploading(false);
          return;
        }
      }

      // Загружаем файлы
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progress[file.name] = 0;
        setUploadProgress({ ...progress });

        try {
          const result = await uploadFile(file);
          newImages.push(result);
          progress[file.name] = 100;
          setUploadProgress({ ...progress });
        } catch (error) {
          alert(`Ошибка при загрузке ${file.name}: ${error.message}`);
        }
      }

      onChange(newImages);
    } catch (error) {
      alert(`Ошибка: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress({});
      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Удаление изображения
  const handleRemove = async (index) => {
    const imageToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);

    // Если изображение загружено в Supabase, удаляем его
    if (!imageToRemove.isTemporary && imageToRemove.path && productId) {
      try {
        await storage.deleteProductImage(imageToRemove.path);
      } catch (error) {
        console.error('Ошибка при удалении файла из Storage:', error);
        // Продолжаем удаление из списка даже если не удалось удалить из Storage
      }
    }

    onChange(newImages);
  };

  // Перемещение изображения (для изменения порядка)
  const handleMove = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onChange(newImages);
  };

  return (
    <div className="image-uploader">
      <div className="image-uploader-header">
        <label className="image-uploader-label">
          Изображения товара *
          <span className="image-uploader-hint">
            (JPG, PNG, WEBP, до {maxSizeMB} МБ)
          </span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          className="image-uploader-input"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="image-uploader-btn"
        >
          {uploading ? 'Загрузка...' : '+ Добавить изображения'}
        </button>
      </div>

      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="image-uploader-progress">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="progress-item">
              <span>{fileName}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="image-uploader-preview">
          {images.map((image, index) => (
            <div key={index} className="image-preview-item">
              <div className="image-preview-wrapper">
                <img 
                  src={image.url} 
                  alt={`Preview ${index + 1}`}
                  className="image-preview-img"
                />
                {image.isTemporary && (
                  <span className="image-temporary-badge">Временное</span>
                )}
                <div className="image-preview-overlay">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="image-preview-btn"
                    title="Переместить вверх"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === images.length - 1}
                    className="image-preview-btn"
                    title="Переместить вниз"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="image-preview-btn image-preview-btn-danger"
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="image-preview-number">{index + 1}</div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="image-uploader-empty">
          <p>Изображения не добавлены</p>
          <p className="image-uploader-empty-hint">
            Нажмите "Добавить изображения" чтобы загрузить фотографии товара
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

import React, { useState } from 'react';
import {
  PremiumHero,
  PremiumSection,
  PremiumProductGrid,
  PremiumSlider,
  PremiumButton,
  PremiumFooter
} from '../components/premium';
import './Premium.css';

const Premium = () => {
  const [email, setEmail] = useState('');

  // Demo products data
  const featuredProducts = [
    {
      id: 1,
      name: 'Seamaster Aqua Terra',
      brand: 'OMEGA',
      price: 5500000,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
      isNew: true
    },
    {
      id: 2,
      name: 'Speedmaster Moonwatch',
      brand: 'OMEGA',
      price: 7200000,
      oldPrice: 8000000,
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop'
    },
    {
      id: 3,
      name: 'Constellation',
      brand: 'OMEGA',
      price: 4800000,
      image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop',
      isNew: true
    },
    {
      id: 4,
      name: 'De Ville Prestige',
      brand: 'OMEGA',
      price: 3500000,
      image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&h=600&fit=crop'
    },
    {
      id: 5,
      name: 'Seamaster Diver 300M',
      brand: 'OMEGA',
      price: 6100000,
      image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&h=600&fit=crop'
    },
    {
      id: 6,
      name: 'Globemaster',
      brand: 'OMEGA',
      price: 5800000,
      oldPrice: 6500000,
      image: 'https://images.unsplash.com/photo-1587925358603-c2eea5305bbc?w=600&h=600&fit=crop'
    }
  ];

  const newArrivals = [
    {
      id: 7,
      name: 'Carrera Chronograph',
      brand: 'TAG Heuer',
      price: 4200000,
      image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&h=600&fit=crop',
      isNew: true
    },
    {
      id: 8,
      name: 'Royal Oak',
      brand: 'Audemars Piguet',
      price: 15000000,
      image: 'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=600&h=600&fit=crop',
      isNew: true
    },
    {
      id: 9,
      name: 'Nautilus',
      brand: 'Patek Philippe',
      price: 45000000,
      image: 'https://images.unsplash.com/photo-1526045431048-f857369baa09?w=600&h=600&fit=crop',
      isNew: true
    },
    {
      id: 10,
      name: 'Submariner Date',
      brand: 'Rolex',
      price: 12500000,
      image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&h=600&fit=crop',
      isNew: true
    }
  ];

  // Footer data
  const footerColumns = [
    {
      title: 'Каталог',
      links: [
        { label: 'Мужские часы', url: '/catalog?gender=men' },
        { label: 'Женские часы', url: '/catalog?gender=women' },
        { label: 'Новинки', url: '/catalog?new=true' },
        { label: 'Распродажа', url: '/catalog?sale=true' }
      ]
    },
    {
      title: 'Бренды',
      links: [
        { label: 'OMEGA', url: '/catalog?brand=omega' },
        { label: 'Rolex', url: '/catalog?brand=rolex' },
        { label: 'TAG Heuer', url: '/catalog?brand=tagheuer' },
        { label: 'Breitling', url: '/catalog?brand=breitling' }
      ]
    },
    {
      title: 'Информация',
      links: [
        { label: 'О компании', url: '/about' },
        { label: 'Доставка', url: '/delivery' },
        { label: 'Гарантия', url: '/warranty' },
        { label: 'Контакты', url: '/contacts' }
      ]
    }
  ];

  const socialLinks = [
    {
      label: 'Instagram',
      type: 'instagram',
      url: 'https://instagram.com/brandwatch.kz',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-8 3.999 3.999 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      )
    },
    {
      label: 'WhatsApp',
      type: 'whatsapp',
      url: 'https://wa.me/77778115151',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      )
    },
    {
      label: 'Telegram',
      type: 'telegram',
      url: 'https://t.me/baikadamov_a',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.638z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="premium-page">
      {/* Hero Section */}
      <PremiumHero
        image="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=1920&h=1080&fit=crop"
        title="Искусство точного времени"
        subtitle="Откройте для себя коллекцию легендарных часов от ведущих мировых брендов. Каждые часы — это история, традиции и непревзойденное мастерство."
        ctaText="Смотреть коллекцию"
        ctaLink="/catalog"
      />

      {/* Featured Collection */}
      <PremiumSection
        title="Избранная коллекция"
        subtitle="Эксклюзивные модели от лучших часовых домов мира"
      >
        <PremiumProductGrid 
          products={featuredProducts}
          columns={3}
        />
        <div className="premium-page__cta">
          <PremiumButton variant="outline" size="large">
            Смотреть все модели
          </PremiumButton>
        </div>
      </PremiumSection>

      {/* New Arrivals Slider */}
      <PremiumSection
        title="Новые поступления"
        subtitle="Последние новинки в нашем каталоге"
        variant="dark"
      >
        <PremiumSlider items={newArrivals} autoPlay={true} />
      </PremiumSection>

      {/* About Section */}
      <PremiumSection variant="gradient">
        <div className="premium-page__about">
          <div className="premium-page__about-content">
            <h2>Почему выбирают нас</h2>
            <p>
              Более 10 лет мы являемся официальным дистрибьютором ведущих часовых брендов в Казахстане. 
              Каждые часы в нашем магазине — это оригинальный товар с полной гарантией производителя.
            </p>
            <div className="premium-page__stats">
              <div className="stat">
                <span className="stat-number">10+</span>
                <span className="stat-label">Лет на рынке</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Премиум брендов</span>
              </div>
              <div className="stat">
                <span className="stat-number">5000+</span>
                <span className="stat-label">Довольных клиентов</span>
              </div>
            </div>
          </div>
        </div>
      </PremiumSection>

      {/* Newsletter CTA */}
      <section className="premium-page__newsletter">
        <div className="premium-page__newsletter-content">
          <h2>Будьте в курсе новинок</h2>
          <p>Подпишитесь на нашу рассылку и получайте эксклюзивные предложения первыми</p>
          <form className="premium-page__newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PremiumButton type="submit" variant="primary">
              Подписаться
            </PremiumButton>
          </form>
        </div>
      </section>

      {/* Footer */}
      <PremiumFooter
        logoText="BRAND WATCH"
        columns={footerColumns}
        socialLinks={socialLinks}
        copyright="© 2024 Brand Watch. Все права защищены."
      />
    </div>
  );
};

export default Premium;

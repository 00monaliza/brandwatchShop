import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      url: 'https://instagram.com',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
        </svg>
      )
    },
    {
      label: 'Facebook',
      url: 'https://facebook.com',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
        </svg>
      )
    },
    {
      label: 'Telegram',
      url: 'https://t.me',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
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

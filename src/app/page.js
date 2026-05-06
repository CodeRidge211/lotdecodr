'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// We'll inject the data from the static data.js
// For now, include essential form data inline or fetch from API

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' }
];

const translations = {
  en: {
    nav: { agencies: 'Agencies', situations: 'Situations', identity: 'Identity', about: 'About' },
    hero: { title: 'The paperwork you need, ', titleAccent: 'explained.', subtitle: 'Stop searching for forms. Get plain English explanations, deadlines, and official download links in one place.', placeholder: 'Search for a form (e.g. W-9, I-485, LLC)', cta: 'Search Forms' },
    sections: { situations: 'Popular Situations', identity: 'Identity & Documents' },
    footer: { privacy: 'Privacy Policy', terms: 'Terms of Service', disclosure: 'Affiliate Disclosure', allRights: 'All rights reserved.', network: 'Network' }
  },
  es: {
    nav: { agencies: 'Agencias', situations: 'Situaciones', identity: 'Identidad', about: 'About' },
    hero: { title: 'El papeleo que necesitas, ', titleAccent: 'explicado.', subtitle: 'Deja de buscar formularios. Obtén explicaciones en lenguaje sencillo, plazos y enlaces oficiales de descarga en un solo lugar.', placeholder: 'Busca un formulario (ej. W-9, I-485, LLC)', cta: 'Buscar Formularios' },
    sections: { situations: 'Situaciones Populares', identity: 'Identidad y Documentos' },
    footer: { privacy: 'Política de Privacidad', terms: 'Términos de Servicio', disclosure: 'Divulgación de Afiliados', allRights: 'Todos los derechos reservados.', network: 'Red' }
  }
};

// Minimal form data for SSR
// Form data will be loaded from public/data.js
const situations = [];
const identityDocs = [];

export default function Home() {
  const [lang, setLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [situationsData, setSituationsData] = useState([]);
  const [identityData, setIdentityData] = useState([]);
  const [allForms, setAllForms] = useState([]);
  const searchRef = useRef(null);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    // Load language preference
    const savedLang = localStorage.getItem('whichforms_lang') || 'en';
    setLang(savedLang);
    
    // Load form data from public files
    fetch('/data.js')
      .then(res => res.text())
      .then(text => {
        // Extract data from the script (strip window. assignment)
        const script = document.createElement('script');
        script.textContent = text;
        document.head.appendChild(script);
        
        if (window.situations) setSituationsData(window.situations);
        if (window.identityDocs) setIdentityData(window.identityDocs);
        if (window.irsForms) setAllForms(prev => [...prev, ...window.irsForms]);
        if (window.uscisForms) setAllForms(prev => [...prev, ...window.uscisForms]);
        if (window.ssaForms) setAllForms(prev => [...prev, ...window.ssaForms]);
        if (window.businessForms) setAllForms(prev => [...prev, ...window.businessForms]);
      })
      .catch(err => console.error('Failed to load form data:', err));
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.length < 2) {
      setShowResults(false);
      return;
    }
    // Filter all forms
    const results = allForms.filter(f => 
      f.name.toLowerCase().includes(query) || 
      (f.form_number && f.form_number.toLowerCase().includes(query)) ||
      f.slug.toLowerCase().includes(query)
    ).slice(0, 8);
    setSearchResults(results);
    setShowResults(true);
  };

  return (
    <>
      <header className={styles.header}>
        <Link href='/' className={styles.logo}>Which<span>Forms</span></Link>
        <nav className={styles.nav}>
          <a href='#'>{t.nav.agencies}</a>
          <a href='#'>{t.nav.situations}</a>
          <a href='#'>{t.nav.identity}</a>
          <a href='#'>{t.nav.about}</a>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1>{t.hero.title}<span>{t.hero.titleAccent}</span></h1>
          <p className={styles.heroSub}>{t.hero.subtitle}</p>
          
          <div className={styles.searchContainer}>
            <input 
              type='text' 
              className={styles.searchBar}
              placeholder={t.hero.placeholder}
              onChange={handleSearch}
              value={searchQuery}
              ref={searchRef}
            />
            <button className={styles.searchBtn}>{t.hero.cta}</button>
            {showResults && searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map(r => (
                  <div key={r.slug} className={styles.searchResultItem}>
                    <div>
                      <h4>{r.form_number ? r.form_number + ': ' : ''}{r.name}</h4>
                      <p>{r.agency}</p>
                    </div>
                    <span>View →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2>{t.sections.situations}</h2>
          <div className={styles.grid}>
            {situationsData.map(sit => (
              <Link key={sit.slug} href={`/form/${sit.slug}`} className={styles.card}>
                <div className={styles.cardTag}>{sit.category}</div>
                <div className={styles.cardTitle}>{sit.title}</div>
                <p className={styles.cardDesc}>{sit.plain_english}</p>
                <div className={styles.cardFooter}>View Required Forms →</div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>{t.sections.identity}</h2>
          <div className={styles.grid}>
            {identityData.map(doc => (
              <Link key={doc.slug} href={`/doc/${doc.slug}`} className={styles.card}>
                <div className={styles.cardTag}>{doc.category}</div>
                <div className={styles.cardTitle}>{doc.name}</div>
                <p className={styles.cardDesc}>{doc.plain_english}</p>
                <div className={styles.cardFooter}>How to Apply →</div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Link href='/' className={styles.footerLogo}>Which<span>Forms</span></Link>
            <p>Making government paperwork understandable for everyone. Plain English explanations of over 500+ official forms.</p>
          </div>
          <div className={styles.footerLinks}>
            <h4>{t.footer.network}</h4>
            <ul>
              <li><a href='https://boringsearch.com'>Boring Search</a></li>
              <li><a href='https://obdvault.com'>OBD Vault</a></li>
              <li><a href='https://ispermitrequired.com'>IsPermitRequired</a></li>
            </ul>
          </div>
          <div className={styles.footerLinks}>
            <h4>Legal</h4>
            <ul>
              <li><a href='/privacy.html'>{t.footer.privacy}</a></li>
              <li><a href='/terms.html'>{t.footer.terms}</a></li>
              <li><a href='/affiliate.html'>{t.footer.disclosure}</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.copyright}>
          © 2026 Sovereign Ridge Partners LLC. Registered in Wyoming. {t.footer.allRights}
        </div>
      </footer>

      {/* Language Switcher */}
      <div className={styles.langSwitcher}>
        <button onClick={() => {
          const nextLang = lang === 'en' ? 'es' : 'en';
          setLang(nextLang);
          localStorage.setItem('whichforms_lang', nextLang);
        }}>
          {LANGUAGES.find(l => l.code === lang)?.flag} {LANGUAGES.find(l => l.code === lang)?.label}
        </button>
      </div>
    </>
  );
}
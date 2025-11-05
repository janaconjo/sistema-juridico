import React, { useState, useEffect } from 'react';
import Chatbot from './Chatbot';
import { useNavigate } from 'react-router-dom';
 import { auth } from '../Firebase/Firebase.js'; 
import './Home.css';


const colorPalette = {
    primary: '#004c4c',     
    secondary: '#3cb371',   
    background: '#f8f8f8', 
    cardBackground: '#ffffff',
    text: '#2d3748',        
    subtle: '#e0f0f0',       
};

const serviceData = [
    { 
        icon: '💬', 
        title: 'Chatbot Jurídico 24/7', 
        description: 'Obtenha respostas imediatas para dúvidas jurídicas básicas com nossa IA especializada.' 
    },
    { 
        icon: '📄', 
        title: 'Análise de Documentos', 
        description: 'Envie seus contratos ou documentos para uma análise rápida e segura por advogados qualificados.' 
    },
    { 
        icon: '📚', 
        title: 'Materiais Educativos', 
        description: 'Acesse guias, vídeos e artigos simplificados para entender melhor seus direitos e deveres.' 
    },
    { 
        icon: '📅', 
        title: 'Agendamento Fácil', 
        description: 'Precisa de ajuda? Agende uma consulta presencial ou online com nossos especialistas.' 
    },
];


const renderServiceIcon = (icon) => (
    <div style={styles.serviceIconContainer}>
        <span style={styles.serviceIconText}>{icon}</span>
    </div>
);


const Home = () => {
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);


 
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const heroBackgroundImages = [
        '/assets/img/closeup-businesspeople-handshake.jpg',
        '/assets/img/job.jpg',
        '/assets/img/CONTRATOSIMPLES.jpg',
    ];


    const [currentGallerySlide, setCurrentGallerySlide] = useState(0);

    const galleryCarouselItems = [
        {
            src: '/assets/img/closeup-businesspeople-handshake.jpg',
            title: 'Parceria de Sucesso',
            fullDescription: 'Acordo histórico que beneficiou centenas de famílias em nossa comunidade.'
        },
        {
            src: '/assets/img/job.jpg',
            title: 'Inovação Tecnológica',
            fullDescription: 'Implementação de novas tecnologias e métodos no suporte jurídico para melhor atendimento.'
        },
        {
            src: '/assets/img/CONTRATOSIMPLES.jpg',
            title: 'Expansão de Atendimento',
            fullDescription: 'Abertura de novos escritórios e expansão para atender mais regiões e pessoas.'
        },
        {
            src: '/assets/img/Educacao.jpg', 
            title: 'Educação Jurídica',
            fullDescription: 'Iniciativas educacionais para descomplicar o direito e tornar a justiça acessível a todos.'
        },
    ];

 
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroSlide((prevSlide) =>
                (prevSlide + 1) % heroBackgroundImages.length
            );
        }, 5000); 
        return () => clearInterval(interval);
    }, [heroBackgroundImages.length]);


    const nextGallerySlide = () => {
        setCurrentGallerySlide((prev) => (prev + 1) % galleryCarouselItems.length);
    };

    const prevGallerySlide = () => {
        setCurrentGallerySlide((prev) =>
            (prev - 1 + galleryCarouselItems.length) % galleryCarouselItems.length
        );
    };

    const handleLinkClick = (hash) => {
        setIsMenuOpen(false); 
        window.location.hash = hash;
    };


    return (
        <div style={styles.baseContainer}>
            <header style={styles.header}>
                <div style={styles.logoArea}>
                    <img src="/assets/img/OIP.webp" alt="IPAJ" style={styles.logo} />
                    <h2 style={styles.title}>IPAJ</h2>
                </div>

                <button
                    className="menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>

                <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
                    <a href="#Serviços" style={styles.link} onClick={() => handleLinkClick('Serviços')}>Serviços</a>
                    <a href="#sobre" style={styles.link} onClick={() => handleLinkClick('sobre')}>Sobre Nós</a>
                    <a href="#materiais" style={styles.link} onClick={() => handleLinkClick('materiais')}>Materiais</a>

                    <button
                        onClick={() => navigate('/Cadastro')}
                        style={styles.registerButton}
                        className="register-button-nav"
                    >
                        Cadastre-se
                    </button>
                </nav>
            </header>


            <section
                style={{
                    ...styles.heroWithBackground,
                    backgroundImage: `url(${heroBackgroundImages[currentHeroSlide]})`,
                }}
                className="animated-hero"
            >
                <div style={styles.overlay}></div>
                <h1
                    style={styles.heroTitle}
                    className="animated-item delay-1"
                >
                    Justiça ao Seu Alcance
                </h1> {/* TÍTULO ATUALIZADO */}
                <p
                    style={styles.heroDescription}
                    className="animated-item delay-2"
                >
                    Instituto de Patrocínio e Assistência Jurídica: Transparência, tecnologia e suporte para seus direitos.
                </p>
                <button
                    style={{
                        ...styles.button,
                        backgroundColor: colorPalette.secondary,
                        zIndex: 10,
                        fontWeight: '700',
                    }}
                    className="animated-item delay-3 hero-action-button"
                    onClick={() => navigate('/Cadastro')}
                >
                    Agende sua Consulta
                </button>
            </section>

     
            <section id="Serviços" style={styles.section}> 
                <h2 style={styles.sectionTitle}>
                    Nossos <strong>Serviços</strong> 
                </h2> 
                <p style={styles.sectionSubtitle}>
                    Utilize nossa plataforma moderna para desburocratizar o acesso à justiça.
                </p>
                <div style={styles.grid}>
                    {serviceData.map((item, index) => (
                        <div key={index} className="service-card" style={styles.card}>
                            {renderServiceIcon(item.icon)}
                            <h3 style={styles.cardTitle}>{item.title}</h3>
                            <p style={styles.cardDescription}>{item.description}</p>
                            {item.title === 'Agendamento Fácil' && (
                                <button
                                    onClick={() => navigate('/Cadastro')}
                                    style={{...styles.button, backgroundColor: colorPalette.primary, marginTop: '1rem', padding: '0.6rem 1.5rem'}}
                                >
                                    Fale Conosco
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>


     
            <section id="sobre" style={styles.sectionAlt}> 
                <h2 style={styles.sectionTitle}>
                    <strong>Sobre</strong> Nós
                </h2> 
                <p style={styles.sectionSubtitleAlt}>
                    Comprometimento com a comunidade e com a excelência no patrocínio jurídico.
                </p>

    

                <div className="carousel-container">
                    <button onClick={prevGallerySlide} className="carousel-nav-button prev">←</button>
                    <div className="carousel-wrapper" style={{ transform: `translateX(-${currentGallerySlide * 100}%)` }}>
                        {galleryCarouselItems.map((item, index) => (
                            <div key={index} className="carousel-item">
                                <img src={item.src} alt={item.title} className="carousel-image" />
                                <div className="carousel-caption">
                                    <h4>{item.title}</h4>
                        
                                    <p style={{fontSize: '1rem', opacity: 0.8}}>{item.fullDescription.split('.')[0]}</p> 
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={nextGallerySlide} className="carousel-nav-button next">→</button>
                </div>

                <div style={styles.carouselIndicators}>
                    {galleryCarouselItems.map((_, idx) => (
                        <span
                            key={idx}
                            style={{
                                ...styles.indicatorDot,
                                backgroundColor: idx === currentGallerySlide ? colorPalette.primary : '#ccc'
                            }}
                            onClick={() => setCurrentGallerySlide(idx)}
                        ></span>
                    ))}
                </div>
            </section>


            {/* 4. SEÇÃO MATERIAIS */}
            <section id="materiais" style={styles.section}> 
                <div style={styles.contentBlock}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2 id="materiais1">
                            <strong>Materiais</strong> Educativos 
                        </h2>
                        <p style={{ color: colorPalette.text, marginBottom: '2rem' }}>
                            Acesse guias, vídeos e artigos simples sobre direito do trabalho, família, heranças e contratos. Nossa biblioteca é constantemente atualizada para mantê-lo informado.
                        </p>
                        <button style={{...styles.button, backgroundColor: colorPalette.primary}} onClick={() => navigate('/Materiais')}>
                            Ver Materiais Educativos
                        </button>
                    </div>
                    <div style={{ flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'flex-end' }}>
                        <img src="/assets/9723646 (1).jpg" alt="Materiais Educativos" style={styles.image} />
                    </div>
                </div>
            </section>

        
            <button
                style={{
                    ...styles.chatbotButton,
                    backgroundColor: colorPalette.secondary,
                }}
                onClick={() => setIsChatOpen(!isChatOpen)}
                title="Falar com o Assistente Jurídico"
                className="chatbotButton pulse-animation" 
            >
                💬
            </button>

            <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

            <footer style={styles.footer}>
                <p>© 2025 IPAJ - Instituto de Patrocínio e Assistência Jurídica | Desenvolvido por Jana Conjo</p>
            </footer>
        </div>
    );
};

export default Home;


const styles = {
    baseContainer: {
        fontFamily: "Roboto, 'Segoe UI', Arial, sans-serif",
        backgroundColor: colorPalette.background,
    },
    header: {
        backgroundColor: colorPalette.primary,
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
    },
    logoArea: {
        display: 'flex',
        alignItems: 'center',
    },
    logo: {
        width: '40px',
        height: '40px',
        marginRight: '1rem',
        borderRadius: '50%',
        backgroundColor: '#fff', 
        padding: '2px', 
    },
    title: {
        color: '#fff',
        fontSize: '1.5rem',
        margin: 0,
        fontWeight: 'bold',
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.3s ease',
    },
    registerButton: {
        padding: '0.75rem 1.5rem', 
        backgroundColor: colorPalette.secondary,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },

    heroWithBackground: {
        minHeight: '100vh',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 2rem',
        gap: '20px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        zIndex: 1,
    },
    heroTitle: {
        fontSize: '4rem', 
        fontWeight: '800',
        maxWidth: '900px',
        lineHeight: '1.1',
        marginBottom: '1rem',
        color: '#fff',
        textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
        zIndex: 10,
    },
    heroDescription: {
        fontSize: '1.5rem',
        maxWidth: '750px',
        margin: '0 auto 2rem auto',
        lineHeight: '1.5',
        fontWeight: '400',
        color: '#fff',
        textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
        zIndex: 10,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 5,
    },

    section: {
        padding: '6rem 2rem', 
        backgroundColor: colorPalette.cardBackground,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    },
    sectionAlt: {
        padding: '6rem 2rem', 
        backgroundColor: colorPalette.subtle,
    },
    sectionTitle: {
        color: colorPalette.primary,
        textAlign: 'center',
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '1rem',
    },
    sectionSubtitle: {
        maxWidth: '800px',
        margin: '0 auto 4rem auto',
        textAlign: 'center',
        color: colorPalette.text,
        fontSize: '1.1rem',
        lineHeight: '1.6',
    },
    sectionTitleAlt: {
        color: colorPalette.text,
        textAlign: 'center',
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '1rem',
    },
    sectionSubtitleAlt: {
        maxWidth: '800px',
        margin: '0 auto 4rem auto',
        textAlign: 'center',
        color: colorPalette.text,
        fontSize: '1.1rem',
        lineHeight: '1.6',
    },

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '2rem',
        marginTop: '2rem',
    },
    card: {
        backgroundColor: colorPalette.cardBackground,
        borderRadius: '12px', 
        padding: '2rem', 
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        textAlign: 'left',
    },
    serviceIconContainer: {
        backgroundColor: colorPalette.secondary,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    serviceIconText: {
        fontSize: '1.8rem',
        color: '#fff',
    },
    cardTitle: {
        color: colorPalette.primary,
        fontSize: '1.4rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
    },
    cardDescription: {
        color: colorPalette.text,
        fontSize: '1rem',
    },
   
    button: {
        padding: '0.75rem 2rem',
        backgroundColor: colorPalette.primary,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        fontWeight: '600',
    },
    contentBlock: {
        display: 'flex',
        gap: '4rem', 
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    image: {
        width: '100%',
        maxWidth: '450px', 
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
    },
    footer: {
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: colorPalette.primary,
        color: '#fff',
        fontSize: '0.9rem',
    },
    chatbotButton: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '50%',
        backgroundColor: colorPalette.secondary,
        color: '#fff',
        fontSize: '26px',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        zIndex: 10000,
        transition: 'transform 0.2s ease-in-out',
    },
    carouselIndicators: { 
        display: 'flex',
        justifyContent: 'center',
        marginTop: '1.5rem',
        gap: '0.5rem',
    },
    indicatorDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#ccc',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
};
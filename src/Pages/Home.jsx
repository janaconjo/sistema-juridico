import React, { useState, useEffect } from 'react';
import Chatbot from './Chatbot';
import { useNavigate } from 'react-router-dom';
// import { auth } from '../Firebase/Firebase.js'; // Descomente se estiver usando Firebase
import './Home.css';


const colorPalette = {
    primary: '#008080',
    secondary: '#3cb371',
    tertiary: '#e0f7f4',
    background: '#f4fbf9',
    cardBackground: '#ffffff',
    text: '#2d3748',
};

const Home = () => {
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    // const [isLoggedIn, setIsLoggedIn] = useState(false); // Descomente se for usar o estado de login
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    // Estados para o Carrossel do Hero
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const heroBackgroundImages = [
        '/assets/img/CONTRATOSIMPLES.jpg',
        '/assets/img/closeup-businesspeople-handshake.jpg',
        '/public/assets/img/job.jpg',
    ];

    // Novo estado para o Carrossel da Galeria
    const [currentGallerySlide, setCurrentGallerySlide] = useState(0);

    // Dados para a Galeria do Carrossel (Simplificados, foco na imagem)
    const galleryCarouselItems = [
        {
            src: '/assets/img/closeup-businesspeople-handshake.jpg',
            title: 'Parceria',
            fullDescription: 'Acordo histórico que beneficiou centenas de famílias em nossa comunidade.'
        },
        {
            src: '/assets/img/job.jpg',
            title: 'Inovação',
            fullDescription: 'Implementação de novas tecnologias e métodos no suporte jurídico para melhor atendimento.'
        },
        {
            src: '/assets/img/CONTRATOSIMPLES.jpg',
            title: 'Expansão',
            fullDescription: 'Abertura de novos escritórios e expansão para atender mais regiões e pessoas.'
        },
        {
            src: '/assets/img/closeup-businesspeople-handshake.jpg',
            title: 'Comunidade',
            fullDescription: 'Eventos e workshops gratuitos para capacitação jurídica e conscientização social.'
        },
        {
            src: '/assets/img/analise2avif.avif', 
            title: 'Assistência',
            fullDescription: 'Projeto de assistência legal a minorias e grupos vulneráveis da sociedade.'
        },
        {
            src: '/assets/img/Educacao.jpg', 
            title: 'Educação',
            fullDescription: 'Iniciativas educacionais para descomplicar o direito e tornar a justiça acessível a todos.'
        },
    ];

    // Efeito para o Carrossel do Hero
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroSlide((prevSlide) =>
                (prevSlide + 1) % heroBackgroundImages.length
            );
        }, 5000); // Muda a cada 5 segundos
        return () => clearInterval(interval);
    }, [heroBackgroundImages.length]);

    // Funções para navegar no Carrossel da Galeria
    const nextGallerySlide = () => {
        setCurrentGallerySlide((prev) => (prev + 1) % galleryCarouselItems.length);
    };

    const prevGallerySlide = () => {
        setCurrentGallerySlide((prev) =>
            (prev - 1 + galleryCarouselItems.length) % galleryCarouselItems.length
        );
    };


    // Função para fechar o menu ao clicar em um link
    const handleLinkClick = (hash) => {
        setIsMenuOpen(false); // Fecha o menu ao clicar em um link
        window.location.hash = hash;
    };


    return (
        <div style={styles.baseContainer}>
            <header style={styles.header}>
                <div style={styles.logoArea}>
                    <img src="/assets/img/OIP.webp" alt="IPAJ" style={styles.logo} />
                    <h2 style={styles.title}>IPAJ</h2>
                </div>

                {/* BOTÃO HAMBÚRGUER (SÓ APARECE EM TELAS PEQUENAS) */}
                <button
                    className="menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>

                {/* NAV DESKTOP E MOBILE (usa className 'nav' para o CSS) */}
                <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
                    <a href="#Serviços" style={styles.link} onClick={() => handleLinkClick('Serviços')}>Serviços</a>
                    <a href="#sobre" style={styles.link} onClick={() => handleLinkClick('sobre')}>Sobre/Galeria</a>
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


            {/* 1. SEÇÃO HERO */}
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
                    Instituto de Patrocínio e Assistência Jurídica
                </h1>
                <p
                    style={styles.heroDescription}
                    className="animated-item delay-2"
                >
                    Uma plataforma moderna e acessível desenvolvida para facilitar o acesso à justiça,
                    promover a transparência e apoiar os cidadãos com informações jurídicas.
                </p>
                <button
                    style={{
                        ...styles.button,
                        backgroundColor: colorPalette.secondary,
                        zIndex: 10,
                    }}
                    className="animated-item delay-3 hero-action-button"
                    onClick={() => navigate('/Cadastro')}
                >
                    Agendar atendimento
                </button>
            </section>

            {/* 2. SERVIÇOS (COM CARDS PADRONIZADOS) */}
            <section id="Serviços" style={styles.sectionAlt}>
                <h2 style={{ color: colorPalette.text, textAlign: 'center' }}>Nossos Principais Serviços e Ferramentas</h2>
                <p style={{ maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'center', color: colorPalette.text }}>
                    Acesso facilitado à justiça através de tecnologia de ponta,
                    desenvolvida para a sua tranquilidade.
                </p>
                <div style={styles.grid}>
                    {/* Card 1 - Chatbot */}
                    <div className="service-card" style={styles.card}> 
                        <img src="src/assets/img/5208996.jpg" alt="Chatbot" style={styles.icon} />
                        <h3>Chatbot Jurídico 24/7</h3>
                        <p style={{ color: colorPalette.text }}>💬 Obtenha respostas imediatas para dúvidas jurídicas básicas com nossa IA especializada.</p>
                    </div>
                    {/* Card 2 - Análise de Documentos */}
                    <div className="service-card" style={styles.card}>
                        <img src="src/assets/img/4906435.jpg" alt="Contratos" style={styles.icon} />
                        <h3>Análise de Documentos</h3>
                        <p style={{ color: colorPalette.text }}>📄 Envie seus contratos ou documentos para uma análise rápida e segura por advogados qualificados.</p>
                    </div>
                    {/* Card 3 - Materiais Educativos */}
                    <div className="service-card" style={styles.card}>
                        <img src="src/assets/img/VEC SAV 285-25.jpg" alt="Materiais" style={styles.icon} />
                        <h3>Materiais Educativos</h3>
                        <p style={{ color: colorPalette.text }}>📚 Acesse guias, vídeos e artigos simplificados para entender melhor seus direitos e deveres.</p>
                    </div>
                    {/* Card 4 - Agendamento Fácil (PADRONIZADO) */}
                    <div className="service-card" style={styles.card}>
                        <img src="src/assets/img/analise2avif.avif" alt="Upload" style={styles.icon} />
                        <h3>Agendamento Fácil</h3>
                        <p style={{ color: colorPalette.text }}>📅 Precisa de ajuda? Agende uma consulta presencial ou online com nossos especialistas.</p>
                        <button
                            onClick={() => navigate('/Cadastro')}
                            style={{...styles.button, backgroundColor: colorPalette.primary, marginTop: '0.5rem'}}
                        >
                            Agendar Agora
                        </button>
                    </div>
                </div>
            </section>


            {/* 3. GALERIA - CARROSSEL COM CURVATURA */}
            <section id="sobre" style={styles.section}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: colorPalette.text }}>Sobre o IPAJ e Nosso Impacto</h2>
                <p style={{ maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'center', color: colorPalette.text }}>
                    Desde a nossa fundação, o IPAJ tem sido um pilar na comunidade, oferecendo patrocínio jurídico de qualidade. Acreditamos que o acesso à justiça deve ser um direito, e não um privilégio. A transparência e o compromisso social guiam todas as nossas ações.
                </p>

                <h3 style={{ textAlign: 'center', margin: '3rem auto 2rem auto', color: colorPalette.primary }}>Nossa Jornada em Imagens</h3>

                <div className="carousel-container">
                    <button onClick={prevGallerySlide} className="carousel-nav-button prev">←</button>
                    <div className="carousel-wrapper" style={{ transform: `translateX(-${currentGallerySlide * 100}%)` }}>
                        {galleryCarouselItems.map((item, index) => (
                            <div key={index} className="carousel-item">
                                <img src={item.src} alt={item.title} className="carousel-image" />
                                <div className="carousel-caption">
                                    <h4>{item.title}</h4>
                                    <p>{item.fullDescription}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={nextGallerySlide} className="carousel-nav-button next">→</button>
                </div>

                {/* Indicadores de slide (pontinhos) */}
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
            <section id="materiais" style={styles.sectionAlt}>
                <div style={styles.contentBlock}>
                    <div style={{ flex: 1 }}>
                        <img src="src/assets/img/Educacao.jpg" alt="Materiais" style={styles.image} />
                    </div>
                    <div style={{ flex: 2 }}>
                        <h2 style={{ color: colorPalette.text }}>Materiais Educativos</h2>
                        <p style={{ color: colorPalette.text }}>
                            Encontre vídeos, guias em PDF e artigos simples sobre temas como:
                            direito do trabalho, direito da família, heranças, contratos e muito mais.
                        </p>
                        <button style={styles.button} onClick={() => navigate('/Materiais')}>
                            Ver Materiais
                        </button>
                    </div>
                </div>
            </section>

            {/* CHATBOT & FOOTER */}
            <button
                style={{
                    ...styles.chatbotButton,
                    transform: isChatOpen ? 'scale(1.1)' : 'scale(1)',
                }}
                onClick={() => setIsChatOpen(!isChatOpen)}
                title="Falar com o Assistente Jurídico"
                className="chatbotButton"
            >
                💬
            </button>

            <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

            <footer style={styles.footer}>
                <p>© 2025  IPAJ | Desenvolvido por Jana Conjo</p>
            </footer>
        </div>
    );
};

export default Home;


// ESTILOS JS (MANTIDOS E AJUSTADOS PARA REFLETIR AS MUDANÇAS)
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
        padding: '0.5rem 1.25rem',
        backgroundColor: colorPalette.secondary,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
    },

    // seccao hero
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
        fontSize: '3.5rem',
        fontWeight: '700',
        maxWidth: '900px',
        lineHeight: '1.2',
        marginBottom: '0.5rem',
        color: '#fff',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        zIndex: 10,
    },

    heroDescription: {
        fontSize: '1.25rem',
        maxWidth: '750px',
        margin: '0 auto 1.5rem auto',
        lineHeight: '1.6',
        fontWeight: '300',
        color: '#fff',
        textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
        zIndex: 10,
    },


    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 5,
    },

    section: {
        padding: '4rem 2rem',
        backgroundColor: colorPalette.cardBackground,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    },
    sectionAlt: {
        padding: '4rem 2rem',
        backgroundColor: colorPalette.tertiary,
    },
    button: {
        marginTop: '1.5rem',
        padding: '0.75rem 2rem',
        // O Card 4 de Serviços usa colorPalette.primary como botão
        backgroundColor: colorPalette.secondary, 
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: colorPalette.primary,
        color: '#fff',
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
    contentBlock: {
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    image: {
        width: '100%',
        maxWidth: '300px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem',
        marginTop: '2rem',
    },
    card: {
        backgroundColor: colorPalette.cardBackground,
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.3s ease',
    },
    icon: {
        width: '50px',
        height: '50px',
        marginBottom: '0.75rem',
    },
    carouselIndicators: { // Estilos para os indicadores (pontinhos)
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
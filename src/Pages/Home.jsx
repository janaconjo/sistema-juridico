import React, { useState, useEffect } from 'react';
import Chatbot from './Chatbot';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Firebase/Firebase.js';
import './Home.css';
// Se for usar ícones, importe-os (ex: de 'react-icons')
// import { FaUser, FaInfoCircle, FaLaptopCode, FaBook, FaSignOutAlt } from 'react-icons/fa';


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
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // NOVO ESTADO PARA O MENU
    const [currentSlide, setCurrentSlide] = useState(0);

    const backgroundImages = [
        '/assets/img/CONTRATOSIMPLES.jpg',
        '/assets/img/closeup-businesspeople-handshake.jpg',
        '/public/assets/img/job.jpg',
    ];


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) =>
                (prevSlide + 1) % backgroundImages.length
            );
        }, 5000);
        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    const galleryImages = [
        'src/assets/img/idosos.jpg',
        'src/assets/img/closeup-businesspeople-handshake.jpg',
        'src/assets/img/photorealistic-lawyer-environment.jpg',
        'src/assets/img/still-life-with-scales-justice.jpg',
        'src/assets/img/front-view-smiley-female-judge.jpg',
        'src/assets/img/happy-friends-hugging-medium-shot.jpg',
        'src/assets/img/right-4703926_1280.jpg',
        'src/assets/img/premium_photo-1661497281000-b5ecb39a2114.avif',
    ];

    const handleImageClick = (src) => {
        setSelectedImage(src);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    // Fecha o menu ao clicar em um link
    const handleLinkClick = (hash) => {
        setIsMenuOpen(false); 
        window.location.hash = hash;
    };

    // Função para simular logout
    const handleLogout = () => {
        console.log("Usuário deslogado!");
        setIsMenuOpen(false); 
        navigate('/login'); 
    };


    return (
        <div style={styles.baseContainer} className={isMenuOpen ? 'menu-open-body-overlay' : ''}>
            <header style={styles.header}>
                <div style={styles.logoArea}>
                    <img src="/assets/img/OIP.webp" alt="IPAJ" style={styles.logo} />
                    <h2 style={styles.title}>IPAJ</h2>
                </div>

                {/* BOTÃO HAMBÚRGUER (sempre visível no mobile, abre/fecha o menu) */}
                <button
                    className="menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    style={styles.menuToggle}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>

                {/* NAV DESKTOP (ainda existe para telas grandes) */}
                <nav className="nav-desktop">
                    <a href="#sobre" style={styles.link} onClick={() => handleLinkClick('sobre')}>Sobre</a>
                    <a href="#Serviços" style={styles.link} onClick={() => handleLinkClick('Serviços')}>Serviços</a>
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

            {/* OVERLAY: Escurece o fundo quando o menu está aberto */}
            {isMenuOpen && (
                <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
            )}

            {/* NOVO MENU LATERAL SLIDE-IN */}
            <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
                <div style={styles.sideMenuHeader}>
                    {/* Botão de fechar (X) - Fica no header do side-menu no CSS */}
                    
                    {/* Perfil do Usuário */}
                    <div style={styles.userProfile}>
                        <img src="https://via.placeholder.com/60" alt="User" style={styles.profileImage} />
                        <div style={styles.profileInfo}>
                            <span style={styles.profileName}>Jana Conjo</span>
                            <span style={styles.profileView}>Ver perfil</span>
                        </div>
                    </div>
                </div>

                <nav style={styles.sideMenuNav}>
                    <a href="#sobre" style={styles.sideMenuLink} onClick={() => handleLinkClick('sobre')}>
                        {/* {<FaInfoCircle />} */} ℹ️ Sobre
                    </a>
                    <a href="#Serviços" style={styles.sideMenuLink} onClick={() => handleLinkClick('Serviços')}>
                        {/* {<FaLaptopCode />} */} 💼 Serviços
                    </a>
                    <a href="#materiais" style={styles.sideMenuLink} onClick={() => handleLinkClick('materiais')}>
                        {/* {<FaBook />} */} 📚 Materiais
                    </a>
                    <a href="#faq" style={styles.sideMenuLink} onClick={() => handleLinkClick('faq')}>
                        {/* {<FaQuestionCircle />} */} ❓ FAQ
                    </a>
                    <button
                        onClick={() => navigate('/Cadastro')}
                        style={{ ...styles.registerButton, ...styles.sideMenuLink }}
                        className="side-menu-register"
                    >
                        ➕ Cadastre-se
                    </button>
                </nav>

                <div style={styles.sideMenuFooter}>
                    <button style={styles.logoutButton} onClick={handleLogout}>
                        {/* {<FaSignOutAlt />} */} 🚪 Log Out
                    </button>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL... (o restante permanece inalterado) */}
            <section
                style={{
                    ...styles.heroWithBackground,
                    backgroundImage: `url(${backgroundImages[currentSlide]})`,
                }}
                className="animated-hero"
            >
                {/* ... (o restante da seção Hero) ... */}
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
            <section id="sobre" style={styles.section}>
                {/* ... (o restante da seção Sobre) ... */}
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: colorPalette.text }}>Missão do IPAJ</h2>
                <p style={{ maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'center', color: colorPalette.text }}>
                    A missão do IPAJ é garantir o acesso à justiça a todos os cidadãos, especialmente os mais
                    vulneráveis, oferecendo assistência jurídica gratuita e informação clara sobre direitos e deveres.
                </p>
                <div style={styles.pinterestGrid}>
                    {galleryImages.map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt={`Foto ${index + 1}`}
                            style={styles.pinterestImage}
                            onClick={() => handleImageClick(src)}
                            loading="lazy"
                        />
                    ))}
                </div>
            </section>

            {selectedImage && (
                <div style={styles.modal} onClick={closeModal}>
                    <img src={selectedImage} alt="Imagem Ampliada" style={styles.modalImage} />
                </div>
            )}

            <section id="Serviços" style={styles.sectionAlt}>
                {/* ... (o restante da seção Serviços) ... */}
                <h2 style={{ color: colorPalette.text }}>Principais Serviços</h2>
                <div style={styles.grid}>
                    <div style={styles.card}>
                        <img src="src/assets/img/5208996.jpg" alt="Chatbot" style={styles.icon} />
                        <p style={{ color: colorPalette.text }}>💬 Chatbot jurídico inteligente 24/7</p>
                    </div>
                    <div style={styles.card}>
                        <img src="src/assets/img/4906435.jpg" alt="Contratos" style={styles.icon} />
                        <p style={{ color: colorPalette.text }}>📄 Análise e explicação de contratos</p>
                    </div>
                    <div style={styles.card}>
                        <img src="src/assets/img/VEC SAV 285-25.jpg" alt="Materiais" style={styles.icon} />
                        <p style={{ color: colorPalette.text }}>📚 Acesso a materiais educativos</p>
                    </div>
                    <div style={styles.card}>
                        <img src="src/assets/img/analise2avif.avif" alt="Upload" style={styles.icon} />
                        <p style={{ color: colorPalette.text }}>📨 Upload de documentos para análise</p>
                    </div>
                </div>
            </section>

            <section id="materiais" style={styles.section}>
                {/* ... (o restante da seção Materiais) ... */}
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

            <button
                style={{
                    ...styles.chatbotButton,
                    transform: isChatOpen ? 'scale(1.1)' : 'scale(1)',
                }}
                onClick={() => setIsChatOpen(!isChatOpen)}
                title="Falar com o Assistente Jurídico"
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

const styles = {
    // ... (Mantém estilos comuns) ...
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
        backgroundColor: colorPalette.primary,
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
    pinterestGrid: {
        columnCount: 3,
        columnGap: '1rem',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    pinterestImage: {
        width: '100%',
        marginBottom: '1rem',
        borderRadius: '10px',
        breakInside: 'avoid',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    },
    modalImage: {
        maxWidth: '90%',
        maxHeight: '90%',
        borderRadius: '10px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    },
    menuToggle: {
        display: 'none', 
    },
    // NOVOS ESTILOS PARA O MENU LATERAL (Side-Menu)
    sideMenuHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: '1.5rem 1rem 1rem 1rem',
        backgroundColor: colorPalette.cardBackground,
        position: 'relative',
        borderBottom: `1px solid ${colorPalette.tertiary}`,
    },
    userProfile: {
        display: 'flex',
        alignItems: 'center',
        // Adiciona um padding à esquerda para compensar o espaço
        paddingLeft: '1rem', 
    },
    profileImage: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        marginRight: '1rem',
        objectFit: 'cover',
        border: `2px solid ${colorPalette.secondary}`,
    },
    profileInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    profileName: {
        fontWeight: 'bold',
        fontSize: '1.1rem',
        color: colorPalette.text,
    },
    profileView: {
        fontSize: '0.85rem',
        color: '#666',
        cursor: 'pointer',
    },
    sideMenuNav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem 0',
        flexGrow: 1, // Permite que a navegação ocupe o espaço extra
    },
    sideMenuLink: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1.5rem',
        borderRadius: '0 10px 10px 0', // Arredondamento à direita (como na imagem)
        textDecoration: 'none',
        color: colorPalette.text,
        fontSize: '1rem',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        marginLeft: '1rem', // Afasta um pouco para criar a sensação de "flutuação"
        // Estilo para ícones, se você usá-los no lugar dos emojis
        '& svg': { 
            marginRight: '0.75rem',
            fontSize: '1.2rem',
            color: colorPalette.primary,
        },
        // Estilo Hover
        '&:hover': {
            backgroundColor: colorPalette.tertiary,
            color: colorPalette.primary,
        },
    },
    sideMenuFooter: {
        marginTop: 'auto', 
        padding: '1rem 1.5rem',
        borderTop: `1px solid ${colorPalette.tertiary}`,
    },
    logoutButton: {
        width: '100%',
        padding: '0.75rem 1rem',
        backgroundColor: '#f44336',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};
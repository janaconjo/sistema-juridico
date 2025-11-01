import React, { useState } from 'react';


const colorPalette = {
    primary: '#008080',     
    secondary: '#3cb371',   
    tertiary: '#e0f7f4',     
    background: '#f4fbf9',   
    cardBackground: '#ffffff',
    text: '#2d3748',        
};

const materiais = [
    {
        id: 2,
        tipo: 'video',
        categoria: 'Direito da Família',
        titulo: 'Divórcio e Guarda de Filhos',
        url: 'https://youtu.be/E3qrfQpTAtU?si=3Fo-wT6mSmwEUDF6',
        thumb: '/materiais/familia-video.jpg',
    },
    {
        id: 5,
        tipo: 'video',
        categoria: 'Contratos',
        titulo: 'Como Redigir um Contrato Legal',
        url: 'https://youtu.be/HZoqakcXml4?si=r4pvSev9QWmtEcMb',
        thumb: '/materiais/contrato-video.jpg',
    },
    {
        id: 8,
        tipo: 'video',
        categoria: 'Heranças',
        titulo: 'Quem Tem Direito à Herança?',
        url: 'https://youtu.be/issJRCmoKUs?si=kUakd4kj3yRF0WR1',
        thumb: '/materiais/heranca-video.jpg',
    },
    {
        id: 1,
        tipo: 'pdf',
        categoria: 'Direito do Trabalho',
        titulo: 'Guia Prático - Direitos do Trabalhador',
        url: 'https://www.dhconsultores.net/images/faq/Lei_do_Trabalho_versao_14_03_2023VF-2.pdf',
        thumb: 'src/assets/img/direitodetrabalho.jpg',
    },
    {
        id: 4,
        tipo: 'pdf',
        categoria: 'Heranças',
        titulo: 'Como Funciona a Partilha de Bens',
        url: 'https://ts.gov.mz/wp-content/uploads/2024/01/Processo-35.pdf',
        thumb: 'src/assets/img/partilhadebens.jpg',
    },
    {
        id: 6,
        tipo: 'pdf',
        categoria: 'Direito do Trabalho',
        titulo: 'Código do Trabalho Moçambicano',
        url: 'https://gpa.co.mz/lei-do-trabalho/',
        thumb: 'src/assets/img/job.jpg',
    },
    {
        id: 9,
        tipo: 'pdf',
        categoria: 'Contratos',
        titulo: 'Modelos de Contratos Comerciais',
        url: 'https://www.direitonet.com.br/contratos/exemplos',
        thumb: 'src/assets/img/exemplosdecontratos.jpg',
    },
    {
        id: 10,
        tipo: 'pdf',
        categoria: 'Direito da Família',
        titulo: 'Direitos e Deveres no Casamento',
        url: 'https://www.docsity.com/en/docs/mozambiacan-family-law/9026827/',
        thumb: 'src/assets/img/casamento.jpg',
    },
];

const categorias = ['Todos', 'Direito do Trabalho', 'Direito da Família', 'Contratos', 'Heranças'];

const Materiais = () => {
    const [filtro, setFiltro] = useState('Todos');
    const [pesquisa, setPesquisa] = useState('');

    const materiaisFiltrados = materiais.filter((item) => {
        return (
            (filtro === 'Todos' || item.categoria === filtro) &&
            item.titulo.toLowerCase().includes(pesquisa.toLowerCase())
        );
    });

    const getEmbedUrl = (url) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^\s&?]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>📚 Materiais Educativos</h1>

            <input
                type="text"
                placeholder="🔍 Procurar por título ou categoria..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                style={styles.searchBar}
            />

            <div style={styles.categorias}>
                {categorias.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFiltro(cat)}
                        style={{
                            ...styles.catButton,
                            backgroundColor: filtro === cat ? colorPalette.primary : colorPalette.tertiary,
                            color: filtro === cat ? colorPalette.cardBackground : colorPalette.text,
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={styles.grid}>
                {materiaisFiltrados.map((item) => (
                    <div key={item.id} style={styles.card}>

                    
                        {(item.tipo === 'pdf' || item.tipo === 'imagem') && (
                            <img src={item.thumb} alt={item.titulo} style={styles.thumb} />
                        )}

                      
                        <h3 style={styles.cardTitle}>{item.titulo}</h3>

                      
                        <div style={styles.cardContent}>
                            {item.tipo === 'video' ? (
                                <iframe
                                    src={getEmbedUrl(item.url)}
                                    title={item.titulo}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={styles.video}
                                />
                            ) : item.tipo === 'pdf' ? (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" style={styles.button}>
                                    📄 Ver PDF
                                </a>
                            ) : (
                                <img src={item.url} alt={item.titulo} style={styles.imagem} />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Materiais;

const styles = {
    container: {
        width: '100%',
       
        padding: '1.5rem', 
        minHeight: '100vh',
        backgroundColor: colorPalette.background,
        maxWidth: '1200px',
        margin: '0 auto',
    },
    title: {
    
        fontSize: '1.8rem', 
        color: colorPalette.primary,
        marginBottom: '1rem',
        borderBottom: `2px solid ${colorPalette.tertiary}`,
        paddingBottom: '8px',
    },
    searchBar: {
        width: '100%',
        padding: '10px', 
        fontSize: '0.95rem',
        marginBottom: '1.2rem',
        borderRadius: '6px',
        border: `1px solid ${colorPalette.secondary}`,
        color: colorPalette.text,
    },
    categorias: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.6rem', 
        marginBottom: '2rem', 
    },
    catButton: {
        padding: '0.5rem 1rem', 
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '0.9rem',
        transition: 'all 0.3s',
    },
    grid: {
        display: 'grid',
      
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
    },
    card: {
        backgroundColor: colorPalette.cardBackground,
        padding: '1rem',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.3s',
    },
    cardTitle: {
        color: colorPalette.text, 
        fontSize: '1.05rem', 
        marginBottom: '0.8rem',
        fontWeight: '600',
        minHeight: '40px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumb: {
        width: '100%',
        height: '150px', 
        objectFit: 'cover',
        borderRadius: '6px',
        marginBottom: '0.8rem',
    },
    cardContent: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    imagem: {
        width: '100%',
        borderRadius: '6px',
    },
    video: {
        width: '100%',
        height: '180px', 
        borderRadius: '6px',
    },
    button: {
        width: '80%',
        display: 'block',
        backgroundColor: colorPalette.primary,
        color: colorPalette.cardBackground,
        padding: '0.6rem 1rem',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: 'bold',
        fontSize: '0.9rem', 
        transition: 'background-color 0.3s',
        marginTop: '0.8rem',
    },
};
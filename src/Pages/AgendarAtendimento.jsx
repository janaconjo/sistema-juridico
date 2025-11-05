import React, { useState } from "react";
import './AgendarAtendimento.css';
import { auth, db } from '../Firebase/Firebase.js'; 
import { collection, addDoc } from "firebase/firestore";

const colorPalette = {
    primary: '#008080',      
    secondary: '#3cb371',
    tertiary: '#e0f7f4',     
    background: '#f4fbf9',   
    cardBackground: '#ffffff',
    text: '#2d3748',         
    success: '#27ae60',
    danger: '#e74c3c',
};


const SimpleContent = ({ title }) => (
    <div style={styles.simpleCard}>
        <h2 style={{ color: colorPalette.primary }}>{title}</h2>
        <p style={{ color: colorPalette.text }}>
        uuu
        </p>
    </div>
);


const DashboardJuridico = () => {

    const [activeSection, setActiveSection] = useState('Agendamento');
    
    const [step, setStep] = useState(1);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [data, setData] = useState("");
    const [descricao, setDescricao] = useState("");

    const totalSteps = 5;
    const progress = ((step - 1) / (totalSteps - 1)) * 100;

    // Formulário 

    const validateAndNext = () => {
        let isValid = false;
        let fieldName = "";

        switch (step) {
            case 1:
                isValid = nome.trim() !== "";
                fieldName = "Nome Completo";
                break;
            case 2:
                isValid = email.trim() !== "" && email.includes("@");
                fieldName = "E-mail válido";
                break;
            case 3:
                isValid = telefone.trim().length >= 8;
                fieldName = "Telefone (mínimo 8 dígitos)";
                break;
            case 4:
                isValid = data.trim() !== "";
                fieldName = "Data do Atendimento";
                break;
            default:
                isValid = false;
        }

        if (isValid) {
            setStep(step + 1);
        } else {
            alert(`Por favor, preencha o campo '${fieldName}' corretamente para continuar.`);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

  
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (descricao.trim() === "") {
            alert("A descrição é obrigatória para agendar.");
            return;
        }
        
        const agendamentoData = {
            nome,
            email,
            telefone,
            data,
            descricao,
            status: "Pendente",
            createdAt: new Date()
        };

        try {
        
            const docRef = await addDoc(collection(db, "agendamentos"), agendamentoData); 
            
            console.log("Documento escrito com ID: ", docRef.id);

            alert("✅ Atendimento agendado com sucesso! Um email de confirmação será enviado.");
            
           

        } catch (error) {
            console.error("Erro ao adicionar documento ao Firebase: ", error);
            alert("❌ Ocorreu um erro ao agendar. Por favor, verifique a sua conexão e a configuração do Firebase.");
        }
    };

    const stepContent = () => {
        switch (step) {
            case 1:
                return { label: "Nome Completo", type: "text", value: nome, onChange: (e) => setNome(e.target.value), placeholder: "Ex: Jana" };
            case 2:
                return { label: "E-mail", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "exemplo@Jana.com" };
            case 3:
                return { label: "Telefone", type: "tel", value: telefone, onChange: (e) => setTelefone(e.target.value), placeholder: "" };
            case 4:
                return { label: "Data Preferencial", type: "date", value: data, onChange: (e) => setData(e.target.value) };
            case 5:
                return { label: "Assunto", isTextarea: true, value: descricao, onChange: (e) => setDescricao(e.target.value), placeholder: "Descreva o seu problema ou dúvida jurídica..." };
            default:
                return {};
        }
    };
    
    const currentStep = stepContent();

    
    const renderMainContent = () => {
        if (activeSection !== 'Agendamento') {
            return <SimpleContent title={activeSection} />;
        }

        
        return (
            <>
                <h1 style={styles.title}>Agende o seu Atendimento Jurídico</h1>
                <p style={styles.subtitle}>
                    Passo {step} de {totalSteps}: {currentStep.label || 'Confirmação'}
                </p>

                
                <div style={styles.progressContainer}>
                    <div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.card}>
                        <label style={styles.label}>{currentStep.label}:</label>
                        
                        {currentStep.isTextarea ? (
                            <textarea
                                style={styles.textarea}
                                value={currentStep.value}
                                onChange={currentStep.onChange}
                                required
                                placeholder={currentStep.placeholder}
                                rows="5"
                            />
                        ) : (
                            <input
                                style={styles.input}
                                type={currentStep.type}
                                value={currentStep.value}
                                onChange={currentStep.onChange}
                                required
                                placeholder={currentStep.placeholder}
                            />
                        )}

                        <div style={styles.buttonContainer}>
                            {step > 1 && (
                                <button style={{ ...styles.button, ...styles.buttonSecondary }} type="button" onClick={handleBack}>
                                    Voltar
                                </button>
                            )}
                            {step < totalSteps && (
                                <button style={styles.button} type="button" onClick={validateAndNext}>
                                    Próximo 
                                </button>
                            )}
                            {step === totalSteps && (
                                <button style={{ ...styles.button, ...styles.buttonConfirm }} type="submit">
                                    ✅ Confirmar
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </>
        );
    };

    
    return (
        <div style={styles.dashboard}>
            
            <aside style={styles.sidebar}>
                <h2 style={styles.logo}><span style={{color: '#fff', fontWeight: 'bold'}}>IPAJ</span> <span style={{color: colorPalette.tertiary}}></span></h2>
                <ul style={styles.menu}>
                    
                    <li 
                        style={{...styles.menuItem, ...(activeSection === 'Agendamento' ? styles.activeMenuItem : {})}}
                        onClick={() => setActiveSection('Agendamento')}
                    >
                        📌 Agendamento
                    </li>
                    <li 
                        style={{...styles.menuItem, ...(activeSection === 'Meus Agendamentos' ? styles.activeMenuItem : {})}}
                        onClick={() => setActiveSection('Meus Agendamentos')}
                    >
                        📅 Meus Agendamentos
                    </li>
                    
                    <li 
                        style={{...styles.menuItem, ...(activeSection === 'Mensagens' ? styles.activeMenuItem : {})}}
                        onClick={() => setActiveSection('Mensagens')}
                    >
                        📨 Mensagens
                    </li>
                    <li 
                        style={{...styles.menuItem, ...(activeSection === 'Configurações' ? styles.activeMenuItem : {})}}
                        onClick={() => setActiveSection('Configurações')}
                    >
                        ⚙️ Configurações
                    </li>
                </ul>
                <div style={styles.sidebarFooter}>
                    <p style={{color: colorPalette.tertiary}}>Precisa de Ajuda Imediata?</p>
                    <button style={styles.helpButton}>Suporte 24h</button>
                </div>
            </aside>

            
            <main style={styles.main}>
                {renderMainContent()}
            </main>

            
            <aside style={styles.rightPanel}>
                <div style={styles.infoCard}>
                    <h3 style={styles.cardTitle}>⚠️ Pré-requisitos</h3>
                    <ul style={styles.infoList}>
                        <li>Forneça detalhes claros para a equipe se preparar.</li>
                        <li>A data e hora serão confirmadas por e-mail após a análise.</li>
                    </ul>
                </div>
                
            </aside>
        </div>
    );
};

export default DashboardJuridico;


const styles = {

    dashboard: {
        display: "grid",
        gridTemplateColumns: "250px 1fr 300px",
        minHeight: "100vh",
        fontFamily: "Roboto, 'Segoe UI', Arial, sans-serif",
        backgroundColor: colorPalette.background,
    },
    sidebar: {
        background: colorPalette.primary, 
        color: "#fff",
        padding: "20px 0",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    logo: {
        padding: "0 20px 20px",
        fontSize: "1.6rem",
        borderBottom: `1px solid ${colorPalette.tertiary}33`,
        marginBottom: '20px',
    },
    menu: { 
        listStyle: "none", 
        padding: 0,
        flexGrow: 1,
    },
    menuItem: {
        margin: "5px 0",
        cursor: "pointer",
        padding: "12px 20px",
        transition: "background-color 0.3s",
        fontSize: '0.95rem',
    },
    activeMenuItem: {
        backgroundColor: '#009688', 
        borderLeft: '4px solid #fff',
        fontWeight: 'bold',
    },
    sidebarFooter: {
        padding: "20px",
        textAlign: 'center',
    },
    helpButton: {
        padding: '10px 15px',
        background: colorPalette.secondary,
        color: colorPalette.primary,
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '10px',
        width: '100%',
        transition: '0.3s',
    },
    main: { padding: "30px 40px" },
    title: { fontSize: "2rem", marginBottom: "5px", color: colorPalette.text, fontWeight: '600' },
    subtitle: { marginBottom: "25px", color: "#666" },
    progressContainer: {
        height: "8px",
        background: colorPalette.tertiary, 
        borderRadius: "5px",
        marginBottom: "30px",
        overflow: 'hidden',
    },
    progressBar: {
        height: "100%",
        background: colorPalette.secondary, 
        borderRadius: "5px",
        transition: "width 0.4s ease-in-out",
    },
    form: { display: "flex", flexDirection: "column", gap: "20px" },
    card: {
        background: colorPalette.cardBackground,
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    },
    simpleCard: {
        background: colorPalette.tertiary,
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        marginTop: '40px',
        borderLeft: `5px solid ${colorPalette.primary}`,
    },
    label: { display: "block", marginBottom: "8px", color: colorPalette.text, fontWeight: '500' },
    input: {
        width: "100%",
        padding: "12px",
        border: `1px solid ${colorPalette.secondary}`,
        borderRadius: "8px",
        marginBottom: "15px",
        fontSize: '1rem',
        backgroundColor: colorPalette.background,
    },
    textarea: {
        width: "100%",
        padding: "12px",
        border: `1px solid ${colorPalette.secondary}`,
        borderRadius: "8px",
        resize: "vertical",
        minHeight: "120px",
        marginBottom: "15px",
        fontSize: '1rem',
        backgroundColor: colorPalette.background,
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
        gap: '15px',
    },
    button: {
        padding: "12px 20px",
        background: colorPalette.primary, 
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: '1rem',
        fontWeight: '600',
        transition: '0.3s',
        minWidth: '150px',
        flexGrow: 1, 
    },
    buttonSecondary: {
        background: colorPalette.tertiary, 
        color: colorPalette.primary,
        flexGrow: 0,
    },
    buttonConfirm: {
        background: colorPalette.success,
        flexGrow: 1,
    },
    rightPanel: {
        padding: "30px 20px",
        borderLeft: "1px solid #eee",
        background: '#fcfcfc',
    },
    infoCard: {
        background: colorPalette.cardBackground,
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        marginBottom: '20px',
        borderLeft: `4px solid ${colorPalette.secondary}`,
    },
    cardTitle: {
        fontSize: '1.1rem',
        color: colorPalette.text,
        marginBottom: '15px',
        fontWeight: '600',
    },
    infoList: {
        listStyleType: 'none',
        paddingLeft: 0,
        fontSize: '0.9rem',
        lineHeight: '1.6',
        color: '#555',
    },
    lawyerList: {
        listStyleType: 'none',
        paddingLeft: 0,
    },
    lawyerItem: {
        padding: '8px 0',
        borderBottom: '1px dotted #eee',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem',
        color: '#333',
    },
    lawyerDot: {
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        marginRight: '10px',
    }
};
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Firebase/Firebase.js'; 
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
} from 'firebase/auth'; 
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PRIMARY_GREEN = '#6c9893ff';     
const LIGHT_GREEN_BACKGROUND = '#E0F2F1'; 
const ERROR_RED = '#D32F2F';          
const ERROR_LIGHT_BACKGROUND = '#FFEBEE'; 

const AuthForm = () => {
    const [activeTab, setActiveTab] = useState('register');
    const [isLawyerRegister, setIsLawyerRegister] = useState(false);
   
    const [nome, setNome] = useState('');
    const [emailReg, setEmailReg] = useState('');
    const [senhaReg, setSenhaReg] = useState('');
    const [nip, setNip] = useState(''); 
    const [categoria, setCategoria] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); 

    const [emailLog, setEmailLog] = useState('');
    const [senhaLog, setSenhaLog] = useState('');

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const resetRegisterFields = () => {
        setNome(''); setEmailReg(''); setSenhaReg(''); setNip(''); setCategoria('');
        setPhoneNumber(''); setError('');
    };
    

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); 

        const userType = isLawyerRegister ? 'advogado' : 'comum';
        
      
        if (!nome || !emailReg || !senhaReg) {
            setError('Por favor, preencha todos os campos obrigatórios: Nome, E-mail e Palavra-passe.');
            return;
        }
        
        const cleanPhoneNumber = phoneNumber.trim().replace(/\s/g, ''); 
        const phoneRegex = /^\+\d{9,16}$/; 
        if (isLawyerRegister && (!nip || !categoria || !cleanPhoneNumber || !phoneRegex.test(cleanPhoneNumber))) {
            setError('Por favor, preencha o NIP, selecione a Categoria e insira o Número de Telefone no formato internacional (+código+número).');
            return;
        }
  

        try {
         
            const userCredential = await createUserWithEmailAndPassword(auth, emailReg, senhaReg);
            const user = userCredential.user;

            const userData = {
                nome, 
                email: emailReg, 
                tipo: userType, 
        
                verificado: true, 
                telefone: isLawyerRegister ? cleanPhoneNumber : null, 
                criadoEm: new Date().toISOString()
            };
            
            if (isLawyerRegister) {
                userData.nip = nip;
                userData.categoria = categoria;
                toast.success('Registo de Advogado efetuado! Pode iniciar sessão.');
            } else {
                toast.success('Registo de Cidadão efetuado com sucesso! Já pode iniciar sessão.');
            }

          
            await setDoc(doc(db, "utilizadores", user.uid), userData);
            
            resetRegisterFields();
            setActiveTab('login');

        } catch (err) {
           
            let errorMessage = 'Erro ao registar. Tente novamente.';
            if (auth.currentUser) { await auth.currentUser.delete().catch(() => {}); }
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Este e-mail já está a ser utilizado.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'A palavra-passe é demasiado fraca (mínimo 6 caracteres).';
            } else {
                console.error("Erro desconhecido no registo:", err);
                errorMessage = 'Erro ao registar: ' + (err.message || 'Verifique a consola e o estado do servidor');
            }
            setError(errorMessage);
        }
    };
    

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!emailLog || !senhaLog) {
            setError('Por favor, preencha o e-mail e a palavra-passe.');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, emailLog, senhaLog);
            const user = userCredential.user;
            
            const userDoc = await getDoc(doc(db, "utilizadores", user.uid));
            if (!userDoc.exists) {
                throw new Error("Dados de utilizador incompletos. Tente registar novamente.");
            }
            
            const userData = userDoc.data();
            
            toast.success('Sessão iniciada com sucesso!');
            
        
            if (userData.tipo === 'advogado') {
                navigate('/advogado'); 
            } else {
                navigate('/AgendarAtendimento'); 
            }
            
        } catch (err) {
            console.error("Erro no login:", err);
            let errorMessage = 'Erro ao iniciar sessão.';
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                errorMessage = 'E-mail ou palavra-passe incorretos.';
            }
            setError(errorMessage);
        }
    };
    
   
    return (
        <div style={styles.wrapper}>
            <ToastContainer />
            <div style={styles.container}>
                
                <div style={styles.imageSection}>
                    <h2 style={styles.title}>IPAJ</h2>
                    <p style={styles.subtitle}>Instituto para o Patrocínio e Assistência Jurídica</p>
                    <p style={styles.welcomeText}>A sua plataforma de acesso à justiça em Moçambique.</p>
                </div>
                
                <div style={styles.formPanel}>
                    
                    <div style={styles.tabHeader}>
                        <button onClick={() => { setIsLawyerRegister(false); setActiveTab('register'); setError(''); resetRegisterFields(); }} style={{ ...styles.tabButton, ...(activeTab === 'register' && !isLawyerRegister ? styles.activeTab : {}) }}>Registar</button>
                        <button onClick={() => { setActiveTab('login'); setError(''); }} style={{ ...styles.tabButton, ...(activeTab === 'login' ? styles.activeTab : {}) }}>Iniciar Sessão</button>
                    </div>
                    
                    <div style={styles.sectionsContainer}>
                        {error && <p style={styles.error}>{error}</p>} 

                        {/* FORM REGISTO */}
                        <form onSubmit={handleRegister} style={{ ...styles.section, ...(activeTab === 'register' ? styles.visible : styles.hidden) }}>
                            <h3 style={styles.sectionTitle}>{isLawyerRegister ? 'Registo de Advogado(a)' : 'Criar Conta'}</h3>
                            
                            <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} style={styles.input} />
                            <input type="email" placeholder="E-mail" value={emailReg} onChange={(e) => setEmailReg(e.target.value)} style={styles.input} />
                            <input type="password" placeholder="Palavra-passe" value={senhaReg} onChange={(e) => setSenhaReg(e.target.value)} style={styles.input} />
                            
                            {isLawyerRegister && (
                                <>
                                    <input placeholder="NIP (Número de Identificação Profissional)" value={nip} onChange={(e) => setNip(e.target.value)} style={styles.input} />
                                    <input 
                                        type="tel"
                                        placeholder="Telefone (+XX YYYYYYYYY)" 
                                        value={phoneNumber} 
                                        onChange={(e) => setPhoneNumber(e.target.value)} 
                                        style={styles.input} 
                                    />
                                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={styles.input}>
                                        <option value="">Selecione a Categoria Profissional</option>
                                        <option value="advogado-estado">Advogado do Estado</option>
                                        <option value="assistente-juridico">Assistente jurídico</option>
                                        <option value="estagiario-juridico">Estagiário jurídico</option>
                                    </select>
                                </>
                            )}

                            <button type="submit" style={styles.submitButton}>Registar</button>
                            
                            <p style={styles.toggleLinkContainer}>
                                {isLawyerRegister ? (
                                    <span onClick={() => { setIsLawyerRegister(false); setError(''); resetRegisterFields(); }} style={styles.toggleLink}>
                                        &laquo; Voltar para Registo Cidadão
                                    </span>
                                ) : (
                                    <span onClick={() => { setIsLawyerRegister(true); setError(''); resetRegisterFields(); }} style={styles.toggleLink}>
                                        É advogado(a)? Clique aqui &raquo;
                                    </span>
                                )}
                            </p>
                        </form>

                        {/* FORM LOGIN */}
                        <form onSubmit={handleLogin} style={{ ...styles.section, ...(activeTab === 'login' ? styles.visible : styles.hidden) }}>
                            <h3 style={styles.sectionTitle}>Entrar</h3>
                            <input type="email" placeholder="E-mail" value={emailLog} onChange={(e) => setEmailLog(e.target.value)} style={styles.input} />
                            <input type="password" placeholder="Palavra-passe" value={senhaLog} onChange={(e) => setSenhaLog(e.target.value)} style={styles.input} />
                            <button type="submit" style={styles.submitButton}>Entrar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};


const styles = {
    wrapper: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        background: '#f4f4f9'
    },
    container: { 
        display: 'flex', 
        maxWidth: '900px', 
        width: '100%', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
    },
    imageSection: { 
        flex: 1, 
        background: PRIMARY_GREEN, 
        color: 'white', 
        padding: '30px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center' 
    },
    title: { fontSize: '24px', marginBottom: '10px' },
    subtitle: { fontSize: '18px', marginBottom: '5px' },
    welcomeText: { fontSize: '16px', marginTop: '15px' },
    formPanel: { flex: 1, background: 'white', padding: '30px' },
    tabHeader: { display: 'flex', marginBottom: '20px', borderBottom: '2px solid #eee' },
    tabButton: { 
        flex: 1, 
        padding: '10px 0', 
        border: 'none', 
        background: 'transparent', 
        cursor: 'pointer', 
        fontSize: '16px', 
        fontWeight: 'bold', 
        color: '#888',
        outline: 'none', 
       
    },
    
    activeTab: { color: PRIMARY_GREEN, borderBottom: `2px solid ${PRIMARY_GREEN}` },
    sectionsContainer: { position: 'relative', minHeight: '350px' }, 
    section: { transition: 'opacity 0.3s ease-in-out', position: 'absolute', top: 0, left: 0, width: '100%', display: 'flex', flexDirection: 'column' },
    visible: { opacity: 1, height: 'auto', position: 'relative' },
    hidden: { opacity: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', position: 'absolute' },
    sectionTitle: { fontSize: '20px', marginBottom: '15px', color: '#333' },
    input: { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
 
    submitButton: { 
        width: '100%', 
        padding: '12px', 
        background: PRIMARY_GREEN, 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        fontSize: '16px', 
        marginTop: '10px',
        WebkitAppearance: 'none', 
        MozAppearance: 'none',
        appearance: 'none',
    },
 
    error: { 
        color: ERROR_RED, 
        margin: '10px 0', 
        padding: '10px', 
        background: ERROR_LIGHT_BACKGROUND, 
        borderLeft: `3px solid ${ERROR_RED}`, 
        borderRadius: '4px' 
    },
    toggleLinkContainer: { textAlign: 'center', marginTop: '15px', fontSize: '14px' },

    toggleLink: { color: PRIMARY_GREEN, cursor: 'pointer', textDecoration: 'underline' },
};

export default AuthForm;
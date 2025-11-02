import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Firebase/Firebase.js'; 
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut 
} from 'firebase/auth'; 
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// URL BASE do seu servidor backend
const API_BASE_URL = 'http://localhost:5001/api'; 

const AuthForm = () => {
    const [activeTab, setActiveTab] = useState('register');
    const [isLawyerRegister, setIsLawyerRegister] = useState(false);
    
    // ESTADOS PARA O FLUXO TOTP/2FA
    const [requiresTotp, setRequiresTotp] = useState(false); 
    const [qrCodeUrl, setQrCodeUrl] = useState(''); 
    const [totpSecret, setTotpSecret] = useState(''); // Chave Secreta recebida do backend
    const [otpCode, setOtpCode] = useState(''); 
    const [phoneNumber, setPhoneNumber] = useState(''); 

    // ESTADOS DO FORMULÁRIO
    const [nome, setNome] = useState('');
    const [emailReg, setEmailReg] = useState(''); // Usado para mostrar o email nas instruções 2FA
    const [senhaReg, setSenhaReg] = useState('');
    const [nip, setNip] = useState(''); 
    const [categoria, setCategoria] = useState('');

    const [emailLog, setEmailLog] = useState('');
    const [senhaLog, setSenhaLog] = useState('');

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const resetRegisterFields = () => {
        // Mantém emailReg para poder ser exibido na tela 2FA, se o user logado falhar
        setNome(''); setSenhaReg(''); setNip(''); setCategoria('');
        setPhoneNumber(''); setError(''); setOtpCode(''); setTotpSecret('');
    };
    
    // --- LÓGICA DE VERIFICAÇÃO TOTP ---
    const handleTotpVerification = async (e) => {
        e.preventDefault();
        setError('');

        if (otpCode.length !== 6) {
            setError('O código do autenticador deve ter 6 dígitos.');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            setError('Erro: Não há sessão ativa para verificar.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/verify-totp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, code: otpCode }) 
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro na verificação do TOTP.');
            }
            
            toast.success('Verificação concluída! A iniciar sessão...');
            setRequiresTotp(false);
            setOtpCode('');
            navigate('/advogado');
            
        } catch (err) {
            setError('Erro ao verificar código: ' + err.message);
        }
    };
    
    // --- LÓGICA DE REGISTO ---
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); 

        const userType = isLawyerRegister ? 'advogado' : 'comum';
        
        // --- (Validações de Campo) ---
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
        // --- Fim Validações ---

        try {
            // 1. Cria o utilizador no Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, emailReg, senhaReg);
            const user = userCredential.user;

            const userData = {
                nome, email: emailReg, tipo: userType, verificado: !isLawyerRegister, 
                telefone: isLawyerRegister ? cleanPhoneNumber : null, criadoEm: new Date().toISOString()
            };
            
            if (isLawyerRegister) {
                userData.nip = nip;
                userData.categoria = categoria;
            }

            // 2. Guarda os dados no Firestore
            await setDoc(doc(db, "utilizadores", user.uid), userData);
            
            if (isLawyerRegister) {
                // 3. Chama o Backend para gerar a chave e enviar o e-mail
                const response = await fetch(`${API_BASE_URL}/generate-totp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailReg, uid: user.uid }) 
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    // Importante: Lidar com erro se o backend falhar
                    throw new Error(errorData.error || 'Falha ao processar o 2FA. Verifique o servidor.');
                }
                
                const data = await response.json();
                
                setQrCodeUrl(data.qrCodeUrl); 
                setTotpSecret(data.secret); // CRÍTICO: Guarda a chave secreta
                
                setRequiresTotp(true);
                toast.info(`Registo concluído! A chave de segurança 2FA foi enviada para o seu e-mail: ${emailReg}.`);

                // Não limpa emailReg para que possa ser usado nas instruções 2FA
                setNome(''); setSenhaReg(''); setNip(''); setCategoria(''); setPhoneNumber('');
                
            } else {
                toast.success('Registo efetuado com sucesso! Já pode iniciar sessão.');
                resetRegisterFields();
                setActiveTab('login');
            }

        } catch (err) {
            // ... (Tratamento de Erro de Registo)
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
    
    // --- LÓGICA DE LOGIN (Omitida por brevidade) ---
    const handleLogin = async (e) => {
        e.preventDefault();
        // ... (Lógica de Login)
    };
    
    // --- Renderização do Formulário TOTP (2FA) ---
    const renderTotpForm = () => (
        <form onSubmit={handleTotpVerification} style={{ ...styles.section, ...styles.visible }}>
            <h3 style={styles.sectionTitle}>Configuração de Segurança 2FA</h3>
            
            {error && <p style={styles.error}>{error}</p>}
            
            {totpSecret ? ( 
                <>
                    <p style={styles.infoText}>1. A sua chave secreta 2FA foi **enviada para o seu e-mail** (<span style={{fontWeight:'bold'}}>{emailReg || auth.currentUser?.email || 'verifique a caixa de entrada'}</span>). Verifique o link de pré-visualização no console do Node.js (Ethereal).</p>
                    <p style={styles.infoText}>2. Instale o aplicativo autenticador (Google Authenticator ou Authy) e insira a chave.</p>
                    
                    {/* Exibe a chave secreta como fallback/confirmação */}
                    <p style={styles.infoText}>
                        **Chave de Segurança (Para introdução manual):**
                    </p>
                    <div style={styles.secretBox}>
                        <code style={styles.secretText}>{totpSecret}</code>
                    </div>
                    
                    {qrCodeUrl && ( // Exibe o QR Code apenas se o backend conseguiu gerá-lo
                        <div style={styles.qrContainer}>
                            <p style={styles.infoText}>--- OU ---</p>
                            <p style={styles.infoText}>3. Leia o **Código QR** abaixo:</p>
                            <img src={qrCodeUrl} alt="Código QR para Google Authenticator" style={styles.qrImage} />
                        </div>
                    )}

                    <p style={styles.infoText}>4. Introduza o **código de 6 dígitos** gerado pela app para concluir.</p>
                </>
            ) : (
                // Esta mensagem aparecerá se o totpSecret vier vazio ou se houver erro
                <p style={styles.error}>O servidor não conseguiu gerar ou enviar a chave de segurança. Verifique a consola do Node.js.</p>
            )}

            <input 
                type="text" 
                placeholder="Código do Autenticador (6 dígitos)" 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value.substring(0, 6))}
                style={styles.input} 
                maxLength="6"
            />
            <button type="submit" style={styles.submitButton}>Verificar Código</button>
            
            <p style={styles.toggleLinkContainer}>
                <span onClick={() => { setRequiresTotp(false); setActiveTab('register'); setError(''); }} style={styles.toggleLink}>
                     &laquo; Voltar ao Registo/Login
                </span>
            </p>
        </form>
    );

    return (
        <div style={styles.wrapper}>
            <ToastContainer />
            <div style={styles.container}>
                {/* Imagem de Fundo (Pode ser ajustada) */}
                <div style={styles.imageSection}>
                    <h2 style={styles.title}>IPAJ</h2>
                    <p style={styles.subtitle}>Instituto para o Patrocínio e Assistência Jurídica</p>
                    <p style={styles.welcomeText}>A sua plataforma de acesso à justiça em Moçambique.</p>
                    {/*  */}
                </div>
                
                <div style={styles.formPanel}>
                    {!requiresTotp && (
                        <div style={styles.tabHeader}>
                            <button onClick={() => { setActiveTab('register'); setError(''); setIsLawyerRegister(false); resetRegisterFields(); }} style={{ ...styles.tabButton, ...(activeTab === 'register' && !isLawyerRegister ? styles.activeTab : {}) }}>Cidadão</button>
                            <button onClick={() => { setActiveTab('login'); setError(''); resetRegisterFields(); }} style={{ ...styles.tabButton, ...(activeTab === 'login' ? styles.activeTab : {}) }}>Iniciar Sessão</button>
                        </div>
                    )}
                    
                    <div style={styles.sectionsContainer}>
                        {requiresTotp ? (
                            renderTotpForm() 
                        ) : (
                            <>
                                {error && <p style={styles.error}>{error}</p>} 

                                {/* FORM REGISTO */}
                                <form onSubmit={handleRegister} style={{ ...styles.section, ...(activeTab === 'register' ? styles.visible : styles.hidden) }}>
                                    <h3 style={styles.sectionTitle}>{isLawyerRegister ? 'Registo de Advogado(a)' : 'Criar Conta (Cidadão Comum)'}</h3>
                                    
                                    <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} style={styles.input} />
                                    <input type="email" placeholder="E-mail" value={emailReg} onChange={(e) => setEmailReg(e.target.value)} style={styles.input} />
                                    <input type="password" placeholder="Palavra-passe" value={senhaReg} onChange={(e) => setSenhaReg(e.target.value)} style={styles.input} />
                                    
                                    {isLawyerRegister && (
                                        <>
                                            <input placeholder="Número de Identificação Profissional (NIP)" value={nip} onChange={(e) => setNip(e.target.value)} style={styles.input} />
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
                                                &laquo; Voltar para Registo de Cidadão Comum
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STYLES ---
const styles = {
    wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f4f4f9' },
    container: { display: 'flex', maxWidth: '900px', width: '100%', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    imageSection: { flex: 1, background: '#007bff', color: 'white', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: '24px', marginBottom: '10px' },
    subtitle: { fontSize: '18px', marginBottom: '5px' },
    caption: { fontSize: '14px' },
    image: { maxWidth: '100%', height: 'auto', borderRadius: '8px', margin: '20px 0' },
    welcomeText: { textAlign: 'center' },
    formPanel: { flex: 1, background: 'white', padding: '30px' },
    tabHeader: { display: 'flex', marginBottom: '20px', borderBottom: '2px solid #eee' },
    tabButton: { flex: 1, padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: '#888' },
    activeTab: { color: '#007bff', borderBottom: '2px solid #007bff' },
    sectionsContainer: { position: 'relative' },
    section: { transition: 'opacity 0.3s ease-in-out', position: 'relative', width: '100%' },
    visible: { opacity: 1, height: 'auto', display: 'block' },
    hidden: { opacity: 0, height: 0, overflow: 'hidden', position: 'absolute' },
    sectionTitle: { fontSize: '20px', marginBottom: '15px', color: '#333' },
    input: { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
    submitButton: { width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' },
    error: { color: 'red', margin: '10px 0', padding: '10px', background: '#ffe0e0', borderLeft: '3px solid red', borderRadius: '4px' },
    infoText: { margin: '10px 0', fontSize: '14px', color: '#555' },
    toggleLinkContainer: { textAlign: 'center', marginTop: '15px', fontSize: '14px' },
    toggleLink: { color: '#007bff', cursor: 'pointer', textDecoration: 'underline' },
    
    // Estilos TOTP (Chave Secreta)
    qrContainer: { textAlign: 'center', margin: '20px 0' },
    qrImage: { maxWidth: '180px', height: 'auto', border: '1px solid #ddd' },
    secretBox: {
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '10px',
        margin: '15px 0',
        textAlign: 'center',
        overflowWrap: 'break-word',
    },
    secretText: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#495057',
        userSelect: 'all', 
    },
};

export default AuthForm;
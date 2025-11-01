import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    HelpCircle,
    LogOut,
    Bell,
    LayoutDashboard,
    Edit,
    Upload,
    Clock, 
    Settings,
    MessageCircle,
    Sun,
    Moon,
    ChevronDown, // Para expandir/recolher o FAQ
    Video,       // Novo ícone para tutoriais
    Link,        // Ícone para link externo
} from 'lucide-react';
// IMPORTAÇÕES DO FIREBASE
import { auth, db } from '../Firebase/Firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 

// DADOS DE EXEMPLO ATUALIZADOS
const processes = [
    { id: 1, status: 'Pendente', nome: 'Janucha Leonardo', processo: 'Divórcio Consensual', tipo: 'Familiar', dataEntrada: '01/Set/2025', prazo: '25/Out/2025' },
    { id: 2, status: 'Andamento', nome: 'Jana Conjo', processo: 'Recurso de Sentença', tipo: 'Administrativo', dataEntrada: '15/Ago/2025', prazo: '05/Nov/2025' },
    { id: 3, status: 'Concluído', nome: 'Olga Bruno', processo: 'Contrato Social', tipo: 'Comercial', dataEntrada: '10/Ago/2025', prazo: '15/Set/2025' },
    { id: 4, status: 'Pendente', nome: 'Leonardo Conjo', processo: 'Contrato Social', tipo: 'Social', dataEntrada: '20/Set/2025', prazo: '20/Out/2025' },
    { id: 5, status: 'Andamento', nome: 'Kevin Conjo', processo: 'Aconselhamento Migratório', tipo: 'Internacional', dataEntrada: '05/Out/2025', prazo: '15/Nov/2025' },
];

const colorPalette = {
    primary: '#008080',
    secondary: '#3cb371',
    tertiary: '#e0f7f4',
    background: '#f4fbf9',
    cardBackground: '#ffffff',
    text: '#2d3748',
    lightText: '#ecf0f1',
    danger: '#e74c3c',
    warning: '#f39c12', 
    info: '#3498db',    
};

// Dados do FAQ
const faqList = [
    {
        q: "Como adiciono um novo processo à lista?",
        a: "Atualmente, o registo de novos processos deve ser feito no sistema central. Assim que inserido, ele será sincronizado automaticamente com seu Dashboard no próximo login."
    },
    {
        q: "Posso alterar o status de um processo?",
        a: "Sim. No Dashboard, clique sobre o processo desejado na tabela para abrir a ficha de detalhes e editar o campo 'Status' e a 'Data de Prazo'."
    },
    {
        q: "Por que não recebi a notificação de prazo?",
        a: "Verifique as 'Configurações' do painel e certifique-se de que os Alertas estão ativados para e-mail e que o prazo no processo está preenchido corretamente."
    },
];

const Advogado = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [hoveredItem, setHoveredItem] = useState(null);
    const [user, setUser] = useState(null);
    
    const [isEditing, setIsEditing] = useState(false);

    // ESTADOS PARA OS DADOS DO PERFIL
    const [attorneyName, setAttorneyName] = useState('Advogado(a)');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [especializacao, setEspecializacao] = useState('');
    
    const [profilePicUrl, setProfilePicUrl] = useState('https://via.placeholder.com/100/008080/FFFFFF?text=AV'); 
    const [selectedFile, setSelectedFile] = useState(null); 
    
    const [loading, setLoading] = useState(true);


    const [appLanguage, setAppLanguage] = useState('Português (Moçambique)');
    const [appTheme, setAppTheme] = useState('Claro');
    const [isAlertsEnabled, setIsAlertsEnabled] = useState(true); 
    const [showFAQ, setShowFAQ] = useState(false);
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setProfilePicUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const loadAttorneyData = async (currentUser) => {
        try {
            const userRef = doc(db, "utilizadores", currentUser.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                
                setAttorneyName(userData.nome || currentUser.displayName || 'Advogado(a)');
                setTelefone(userData.telefone || '');
                setEspecializacao(userData.especializacao || '');
                setProfilePicUrl(userData.profilePicUrl || 'https://via.placeholder.com/100/008080/FFFFFF?text=AV');
                setEmail(currentUser.email);
                
         
                setAppLanguage(userData.configLanguage || 'Português (Moçambique)');
                setAppTheme(userData.configTheme || 'Claro');
                setIsAlertsEnabled(userData.configAlerts || true);

            } else {
                setAttorneyName(currentUser.displayName || 'Advogado(a)');
                setEmail(currentUser.email);
                setProfilePicUrl('https://via.placeholder.com/100/008080/FFFFFF?text=AV');
            }
        } catch (error) {
            console.error("Erro ao carregar dados do advogado:", error);
        } finally {
            setLoading(false);
        } 
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, "utilizadores", user.uid);

            let newProfilePicUrl = profilePicUrl;
            if (selectedFile) {
                alert('Atenção:Não foi possivel fazer o upload da foto.');
            }
            
            await updateDoc(userRef, {
                nome: attorneyName,
                telefone: telefone,
                especializacao: especializacao,
                profilePicUrl: newProfilePicUrl,
            });
            
            alert('Perfil atualizado com sucesso!');
            setIsEditing(false);
            setSelectedFile(null);
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            alert('Erro ao salvar o perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

   
    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, "utilizadores", user.uid);
            
            await updateDoc(userRef, {
                configLanguage: appLanguage,
                configTheme: appTheme,
                configAlerts: isAlertsEnabled,
            });

            alert('Configurações salvas com sucesso!');
            setActiveSection('dashboard');
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            alert('Erro ao salvar as configurações.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await loadAttorneyData(currentUser); 
            } else {
                navigate('/login'); 
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    const menuItems = [
        { label: 'Dashboard', icon: <LayoutDashboard size={18} />, section: 'dashboard' },
        { label: 'Perfil', icon: <User size={18} />, section: 'perfil' },
        { label: 'Ajuda', icon: <HelpCircle size={18} />, section: 'ajuda' },
        { label: 'Notificações', icon: <Bell size={18} />, section: 'notificacoes' },
        { label: 'Configurações', icon: <Settings size={18} />, section: 'configuracoes' },
        { label: 'Sair', icon: <LogOut size={18} />, action: handleLogout, danger: true },
    ];


    const getStatusInfo = (status) => {
        switch (status) {
            case 'Pendente':
                return { color: colorPalette.warning, label: 'Pendente', icon: <Bell size={14} /> };
            case 'Andamento': 
                return { color: colorPalette.info, label: 'Andamento', icon: <Clock size={14} /> };
            case 'Concluído':
                return { color: colorPalette.secondary, label: 'Concluído', icon: <Clock size={14} /> };
            default:
                return { color: colorPalette.text, label: status };
        }
    };

    const renderProcessesTable = () => (
        <div style={styles.card}>
            <h3 style={{ ...styles.sectionTitle, marginBottom: '20px' }}>Processos em Curso e Prazos</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Nome do Cliente</th>
                        <th style={styles.th}>Assunto/Processo</th>
                        <th style={styles.th}>Tipo</th>
                        <th style={styles.th}>Data de Entrada</th>
                        <th style={styles.th}>Data Limite</th>
                        <th style={styles.th}>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {processes.map((p) => {
                        const statusInfo = getStatusInfo(p.status);
                        return (
                            <tr key={p.id} style={styles.tr}>
                                <td style={styles.td}>{p.nome}</td>
                                <td style={styles.td}>{p.processo}</td>
                                <td style={styles.td}>{p.tipo}</td>
                                <td style={styles.td}>{p.dataEntrada}</td>
                                <td style={styles.td}>{p.prazo}</td>
                                <td style={{ ...styles.td, fontWeight: 'bold', color: statusInfo.color }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {statusInfo.icon}
                                        {statusInfo.label}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    const renderConfigurations = () => (
        <div style={{ ...styles.card, minWidth: 'auto', flex: 1 }}>
            <h3 style={styles.sectionTitle}>Configurações do Sistema</h3>
     
            <div style={styles.configItem}>
                <h4 style={styles.configTitle}><Settings size={18} style={{ color: colorPalette.primary }} /> Idioma do Painel</h4>
                <p style={styles.configText}>Selecione o idioma de exibição do sistema.</p>
                <select 
                    value={appLanguage} 
                    onChange={(e) => setAppLanguage(e.target.value)} 
                    style={styles.selectField}
                >
                    <option value="Português ">Português</option>
                    <option value="Inglês (EUA)">Inglês</option>
                    <option value="Francês">Francês</option>
                </select>
            </div>
            
            <div style={styles.configItem}>
                <h4 style={styles.configTitle}>
                    {appTheme === 'Claro' ? <Sun size={18} style={{ color: colorPalette.primary }} /> : <Moon size={18} style={{ color: colorPalette.primary }} />} 
                    Tema de Cores
                </h4>
                <p style={styles.configText}>Escolha o esquema de cores.</p>
                <div style={styles.radioGroup}>
                    <label>
                        <input 
                            type="radio" 
                            value="Claro" 
                            checked={appTheme === 'Claro'}
                            onChange={() => setAppTheme('Claro')}
                        /> Claro
                    </label>
                    <label style={{ marginLeft: '20px' }}>
                         <input 
                            type="radio" 
                            value="Escuro" 
                            checked={appTheme === 'Escuro'}
                            onChange={() => setAppTheme('Escuro')}
                        /> Escuro
                    </label>
                </div>
            </div>

            <div style={styles.configItem}>
                <h4 style={styles.configTitle}>
                    <Bell size={18} style={{ color: colorPalette.primary }} /> 
                    Ativar Alertas de Prazo
                </h4>
                <p style={styles.configText}>Receber notificações pop-up e e-mail sobre prazos críticos.</p>
                <label style={styles.toggleSwitch}>
                    <input 
                        type="checkbox" 
                        checked={isAlertsEnabled} 
                        onChange={(e) => setIsAlertsEnabled(e.target.checked)}
                    />
                    <span style={styles.slider}></span>
                </label>
                <span style={{marginLeft: '15px', color: isAlertsEnabled ? colorPalette.secondary : colorPalette.danger, fontWeight: 'bold'}}>
                    {isAlertsEnabled ? 'ATIVO' : 'DESATIVADO'}
                </span>
            </div>

            <button 
                onClick={handleSaveSettings} 
                style={styles.primaryButton}
            >
                Guardar Configurações
            </button>
        </div>
    );



    const renderHelpSection = () => (
        <div style={{ ...styles.card, minWidth: 'auto', flex: 1 }}>
            <h3 style={styles.sectionTitle}>Central de Ajuda e Recursos</h3>
            <p style={styles.sectionText}>Encontre documentação, tutoriais e respostas para as dúvidas mais comuns sobre o  painel de gestão de processos.</p>
 
            <div 
                style={{ ...styles.supportItem, cursor: 'pointer', backgroundColor: showFAQ ? colorPalette.tertiary : 'transparent' }}
                onClick={() => setShowFAQ(!showFAQ)}
            >
                <MessageCircle size={16} style={{ color: colorPalette.primary }} />
                <p style={{ fontWeight: 'bold' }}>FAQ - Perguntas Frequentes sobre o Painel</p>
                <ChevronDown size={16} style={{ marginLeft: 'auto', transform: showFAQ ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
            </div>
            
        
            {showFAQ && (
                <div style={styles.faqContainer}>
                    {faqList.map((item, index) => (
                        <div key={index} style={styles.faqItem}>
                            <p style={styles.faqQuestion}> {item.q}</p>
                            <p style={styles.faqAnswer}>{item.a}</p>
                        </div>
                    ))}
                </div>
            )}

            <a 
                href="https://youtu.be/JC7liHCf_ak?si=z3QjqFeGhdgMUQSk" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.videoLink}
            >
                <Video size={16} style={{ color: colorPalette.danger }} />
                <p style={{ fontWeight: 'bold' }}>Tutoriais em Vídeo: Como gerir um novo processo</p>
                <Link size={16} style={{ marginLeft: 'auto', color: colorPalette.info }} />
            </a>
            
            <div style={styles.supportItem}>
                <MessageCircle size={16} style={{ color: colorPalette.primary }} />
                <p>Diretório de Contactos Úteis (PGR,Sernic, etc.)</p>
            </div>
            
            <button style={{...styles.secondaryButton, marginTop: '20px'}}>Contactar Suporte (E-mail)</button>
        </div>
    );
    
    const renderSection = () => {
        if (loading) {
            return <p style={{ color: colorPalette.primary }}>A carregar dados...</p>;
        }

        switch (activeSection) {
            case 'perfil':
            
                return (
                    <div style={{ ...styles.card, minWidth: 'auto', flex: 1 }}>
                        <h3 style={styles.sectionTitle}>
                            {isEditing ? 'Editar Perfil' : 'Informações do Perfil'}
                            <button 
                                onClick={() => setIsEditing(!isEditing)} 
                                style={{ ...styles.editButton, backgroundColor: isEditing ? colorPalette.danger : colorPalette.primary }}
                                disabled={loading}
                            >
                                <Edit size={16} /> {isEditing ? 'Cancelar' : 'Editar'}
                            </button>
                        </h3>
                        
                        <div style={styles.profileInfo}>
                            {profilePicUrl && profilePicUrl.startsWith('http') ? (
                                <img 
                                    src={profilePicUrl} 
                                    alt="Foto de Perfil" 
                                    style={styles.profilePic} 
                                />
                            ) : (
                                <div style={styles.profileIconContainer}>
                                    <User size={50} color={colorPalette.lightText} />
                                </div>
                            )}

                            {isEditing && (
                                <div style={styles.uploadContainer}>
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="profile-upload" style={styles.uploadButton}>
                                        <Upload size={16} />
                                        {selectedFile ? 'Trocar Imagem' : 'Carregar Imagem'}
                                    </label>
                                    {selectedFile && <p style={styles.fileName}>{selectedFile.name}</p>}
                                </div>
                            )}
                            
                        </div>

                        <div style={styles.profileDetails}>
                            <div style={styles.detailRow}>
                                <p style={styles.profileLabel}>Nome:</p>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={attorneyName} 
                                        onChange={(e) => setAttorneyName(e.target.value)}
                                        style={styles.inputField} 
                                    />
                                ) : (
                                    <p style={styles.profileValue}>{attorneyName}</p>
                                )}
                            </div>

                            <div style={styles.detailRow}>
                                <p style={styles.profileLabel}>E-mail:</p>
                                <p style={styles.profileValue}>{email}</p> 
                            </div>

                            <div style={styles.detailRow}>
                                <p style={styles.profileLabel}>Telefone:</p>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={telefone} 
                                        onChange={(e) => setTelefone(e.target.value)}
                                        style={styles.inputField} 
                                    />
                                ) : (
                                    <p style={styles.profileValue}>{telefone || 'N/A'}</p>
                                )}
                            </div>

                            <div style={styles.detailRow}>
                                <p style={styles.profileLabel}>Especialização:</p>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={especializacao} 
                                        onChange={(e) => setEspecializacao(e.target.value)}
                                        style={styles.inputField} 
                                    />
                                ) : (
                                    <p style={styles.profileValue}>{especializacao || 'Não definida'}</p>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <button 
                                onClick={handleSaveProfile} 
                                style={styles.primaryButton}
                                disabled={loading}
                            >
                                {loading ? 'A Guardar...' : 'Guardar Alterações'}
                            </button>
                        )}
                    </div>
                );
            case 'ajuda':
                return renderHelpSection();

            case 'notificacoes':
    
                return (
                    <div style={{ ...styles.card, minWidth: 'auto', flex: 1 }}>
                        <h3 style={styles.sectionTitle}>Alertas e Mensagens Recentes</h3>
                        <p style={styles.sectionText}></p>
                        
                        <div style={{...styles.notificationItem, borderLeft: `5px solid ${colorPalette.danger}`}}>
                            <Bell size={16} color={colorPalette.danger} />
                            <p>ALERTA DE PRAZO! Prazo final (24h) para o processo Divórcio Consensual.</p>
                        </div>
                         <div style={{...styles.notificationItem, borderLeft: `5px solid ${colorPalette.warning}`}}>
                            <Bell size={16} color={colorPalette.warning} />
                            <p>Novo contacto de cliente recebido (Zuri senzi).</p>
                        </div>
                         <div style={{...styles.notificationItem, borderLeft: `5px solid ${colorPalette.info}`}}>
                            <Bell size={16} color={colorPalette.info} />
                            <p>Seu perfil foi atualizado com sucesso.</p>
                        </div>

                        <button style={{...styles.secondaryButton, marginTop: '15px'}}>Ver todas as Notificações</button>
                    </div>
                );
            case 'configuracoes':
                return renderConfigurations(); 

            default:
                return (
                    <>
                        {renderProcessesTable()}
                    </>
                );
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.sidebar}>
                <h2 style={styles.logo}>Painel Adv.</h2>
                <ul style={styles.menu}>
                    {menuItems.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => item.action ? item.action() : setActiveSection(item.section)}
                            onMouseEnter={() => setHoveredItem(item.section || 'logout')}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                ...styles.menuItem,
                                color: item.danger ? colorPalette.danger : colorPalette.lightText,
                                backgroundColor: activeSection === item.section ? colorPalette.secondary : 
                                    (hoveredItem === (item.section || 'logout') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'),
                                fontWeight: activeSection === item.section ? 'bold' : 'normal',
                                borderLeft: activeSection === item.section ? `3px solid ${colorPalette.tertiary}` : 'none',
                                paddingLeft: activeSection === item.section ? '17px' : '20px',
                            }}
                        >
                            <span style={styles.icon}>{item.icon}</span>
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={styles.mainContent}>
                <h1 style={styles.title}>Bem-vindo(a), {attorneyName}!</h1>
                {renderSection()}
            </div>
        </div>
    );
};


const styles = {

    wrapper: {
        display: 'flex',
        height: '100vh',
        minHeight: '100vh',
        fontFamily: 'Segoe UI, sans-serif',
        backgroundColor: colorPalette.background,
    },
    sidebar: {
        width: '220px', 
        backgroundColor: colorPalette.primary, 
        color: colorPalette.lightText,
        padding: '15px 0', 
        boxShadow: '4px 0 10px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
    },
    logo: {
        fontSize: '1.4rem', 
        marginBottom: '20px',
        textAlign: 'center',
        fontWeight: 'bold',
        padding: '0 15px',
    },
    menu: {
        listStyle: 'none',
        padding: 0,
        flex: 1,
    },
    menuItem: {
        margin: '3px 0', 
        padding: '10px 20px',
        cursor: 'pointer',
        fontSize: '0.95rem', 
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: '0.3s ease-in-out',
    },
    icon: {
        display: 'inline-block',
    },
    mainContent: {
        flex: 1,
        padding: '30px', 
        overflowY: 'auto',
    },
    title: {
        fontSize: '2rem', 
        marginBottom: '25px',
        color: colorPalette.text,
        borderBottom: `2px solid ${colorPalette.tertiary}`,
        paddingBottom: '8px',
    },
    sectionTitle: {
        fontSize: '1.4rem',
        marginBottom: '15px',
        color: colorPalette.primary,
        borderBottom: `1px solid ${colorPalette.tertiary}`,
        paddingBottom: '6px',
        display: 'flex',
        justifyContent: 'space-between', 
        alignItems: 'center',
    },
    card: {
        backgroundColor: colorPalette.cardBackground,
        padding: '20px', 
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        marginBottom: '15px',
    },
    

    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
    },
    th: {
        backgroundColor: colorPalette.primary,
        color: colorPalette.lightText,
        padding: '12px 15px',
        fontSize: '0.9rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    td: {
        padding: '12px 15px',
        borderBottom: `1px solid ${colorPalette.tertiary}`,
        color: colorPalette.text,
        fontSize: '0.9rem',
    },
    tr: {
        transition: 'background-color 0.2s',
        cursor: 'pointer',
    },
    
 
    sectionText: {
        color: colorPalette.text,
        marginBottom: '20px',
        lineHeight: '1.5',
        fontSize: '0.95rem',
    },
    supportItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 15px',
        borderBottom: `1px dotted ${colorPalette.tertiary}`,
        color: colorPalette.text,
        transition: 'background-color 0.2s',
        borderRadius: '5px',
    },
    notificationItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        marginBottom: '8px',
        borderRadius: '5px',
        backgroundColor: colorPalette.tertiary,
        color: colorPalette.text,
    },

    configItem: {
        padding: '15px 0',
        borderBottom: `1px solid ${colorPalette.tertiary}`,
        marginBottom: '10px',
    },
    configTitle: {
        fontSize: '1.1rem',
        color: colorPalette.primary,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '5px',
    },
    configText: {
        fontSize: '0.9rem',
        color: colorPalette.text,
        marginBottom: '10px',
    },
    selectField: {
        padding: '10px',
        borderRadius: '5px',
        border: `1px solid ${colorPalette.tertiary}`,
        fontSize: '1rem',
        width: '250px',
        backgroundColor: colorPalette.cardBackground,
        color: colorPalette.text,
    },
    radioGroup: {
        display: 'flex',
        gap: '20px',
        marginTop: '10px',
    },
    toggleSwitch: {
        position: 'relative',
        display: 'inline-block',
        width: '60px',
        height: '34px',
        verticalAlign: 'middle',
    },
    slider: {
        position: 'absolute',
        cursor: 'pointer',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ccc',
        transition: '.4s',
        borderRadius: '34px',
    },

    'input[type="checkbox"]:checked + .slider': {
        backgroundColor: colorPalette.secondary,
    },
    'input[type="checkbox"] + .slider:before': {
        position: 'absolute',
        content: '""',
        height: '26px',
        width: '26px',
        left: '4px',
        bottom: '4px',
        backgroundColor: 'white',
        transition: '.4s',
        borderRadius: '50%',
    },
    'input[type="checkbox"]:checked + .slider:before': {
        transform: 'translateX(26px)',
    },


    faqContainer: {
        backgroundColor: colorPalette.tertiary,
        padding: '15px',
        borderRadius: '5px',
        marginTop: '10px',
        marginBottom: '15px',
    },
    faqItem: {
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: `1px dotted ${colorPalette.primary}`,
    },
    faqQuestion: {
        fontWeight: 'bold',
        color: colorPalette.primary,
        marginBottom: '5px',
    },
    faqAnswer: {
        fontSize: '0.9rem',
        color: colorPalette.text,
        paddingLeft: '10px',
    },

    videoLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 15px',
        backgroundColor: '#fbebeb', 
        borderLeft: `5px solid ${colorPalette.danger}`,
        color: colorPalette.text,
        textDecoration: 'none',
        borderRadius: '5px',
        marginTop: '10px',
        marginBottom: '15px',
    },

    secondaryButton: {
        backgroundColor: colorPalette.info,
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'background-color 0.3s',
    },

    profileInfo: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
        gap: '20px',
        flexDirection: 'column', 
        borderBottom: `1px solid ${colorPalette.tertiary}`,
        paddingBottom: '15px',
    },
    profileIconContainer: { 
        width: '100px', 
        height: '100px',
        borderRadius: '50%',
        backgroundColor: colorPalette.primary,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: `3px solid ${colorPalette.secondary}`,
    },
    profilePic: { 
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: `3px solid ${colorPalette.secondary}`,
    },
    uploadContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        marginTop: '10px',
    },
    uploadButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: colorPalette.secondary,
        color: 'white',
        padding: '8px 15px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'background-color 0.3s',
        whiteSpace: 'nowrap'
    },
    fileName: {
        fontSize: '0.85rem',
        color: colorPalette.text,
    },
    profileDetails: {
        paddingTop: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    detailRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px 0',
        borderBottom: `1px dotted ${colorPalette.tertiary}`,
    },
    profileLabel: {
        fontWeight: 'bold',
        color: colorPalette.text,
        minWidth: '120px',
    },
    profileValue: {
        flex: 1,
        color: colorPalette.text,
        textAlign: 'right',
    },
    inputField: {
        flex: 1,
        padding: '8px',
        borderRadius: '5px',
        border: `1px solid ${colorPalette.tertiary}`,
        fontSize: '1rem',
        textAlign: 'right',
    },
    editButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'background-color 0.3s',
    },
    primaryButton: {
        backgroundColor: colorPalette.primary,
        color: 'white',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        marginTop: '20px',
        transition: 'background-color 0.3s',
        width: '100%',
    }
};

export default Advogado;
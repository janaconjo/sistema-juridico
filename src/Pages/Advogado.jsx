import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    HelpCircle,
    LogOut,
    Bell,
    LayoutDashboard,
    Settings,
    Mail, 
    Menu, 
    Users, 
    Calendar, 
    CheckCircle, 
    Clock,
    Search,
    FileText,
    Download, 
    MessageCircle, 
    XCircle, 
    ClipboardCheck, 
    Edit,
    ArrowRight,
    Sun, 
    Moon, 
    ChevronDown, 
    ChevronUp,
    Send,
} from 'lucide-react';


import { auth, db } from '../Firebase/Firebase.js'; 
import {
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import {
    doc,
    getDoc,
    updateDoc, 
    collection,
    query,
    orderBy,
    onSnapshot 
} from 'firebase/firestore';


import {
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'firebase/storage';


const fetchProfileData = async (userRef) => {
    let determinedName = userRef.displayName || userRef.email.split('@')[0];
    if (determinedName.length > 0) {
        determinedName = determinedName.charAt(0).toUpperCase() + determinedName.slice(1);
    }

    try {
        const docRef = doc(db, "advogados", userRef.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            const nomeCompleto = data.nomeCompleto || determinedName;
            
            setAttorneyName(nomeCompleto); 
            setProfileData({
                nomeCompleto: nomeCompleto,
                telefone: data.telefone || '',
                especializacao: data.especializacao || 'Direito Geral',
            });
            setProfilePictureUrl(data.profilePictureUrl || null); 
        } else {
            setAttorneyName(determinedName);
            setProfileData(prev => ({ ...prev, nomeCompleto: determinedName }));
            setProfilePictureUrl(null); 
        }
    } catch (error) {
        console.error("Erro ao carregar perfil do advogado:", error);
        setAttorneyName(determinedName);
    }
};


const baseColorPalette = {
    primary: '#008080', 
    secondary: '#3cb371', 
    info: '#3498db', 
    danger: '#e74c3c', 
    warning: '#f39c12',
    primaryColor: '#008080',
};


const getThemeColors = (theme) => ({
    ...baseColorPalette,
  
    cardBackground: theme === 'light' ? '#ffffff' : '#2d3748',
    background: theme === 'light' ? '#f4fbf9' : '#1a202c',
    text: theme === 'light' ? '#2d3748' : '#e2e8f0',
    lightText: theme === 'light' ? '#ecf0f1' : '#a0aec0', 
    grayText: theme === 'light' ? '#6B7280' : '#a0aec0',
    border: theme === 'light' ? '#E3E8EF' : '#4a5568',
    lightBackground: theme === 'light' ? '#F7F8FA' : '#2d3748',
});


const Advogado = () => {
    const navigate = useNavigate();
  
    const storedTheme = localStorage.getItem('appTheme') || 'light';
    const [theme, setTheme] = useState(storedTheme);
    const colorPalette = getThemeColors(theme);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const [activeSection, setActiveSection] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const storage = getStorage(); 
    const [agendamentos, setAgendamentos] = useState([]); 
    const [processos, setProcessos] = useState([]); 
    
    const [attorneyName, setAttorneyName] = useState('Advogado(a)'); 
    
    const [profileData, setProfileData] = useState({
        nomeCompleto: '',
        telefone: '',
        especializacao: 'Direito Geral', 
    });
    const [profilePictureUrl, setProfilePictureUrl] = useState(null); 
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); 

    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilter, setCurrentFilter] = useState('All'); 
    const [faqOpen, setFaqOpen] = useState(null); 
    const [supportMessage, setSupportMessage] = useState({ subject: '', body: '' });

  
    useEffect(() => {
     
        document.body.style.backgroundColor = colorPalette.background;
    }, [theme]);
    
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('appTheme', newTheme);
    };

   
    const handleSettingsChange = (setting, value) => {
        if (setting === 'notifications') {
            setNotificationsEnabled(value);
           
        }
    };

    const handleFaqToggle = (id) => {
        setFaqOpen(faqOpen === id ? null : id);
    };

    const handleSupportSubmit = (e) => {
        e.preventDefault();
        console.log("Mensagem de Suporte Enviada:", supportMessage);
      
        alert(`Sua mensagem foi enviada (Assunto: ${supportMessage.subject}). Responderemos em breve.`);
        setSupportMessage({ subject: '', body: '' });
    };

   
    const handleLogout = async () => { 
        try { await signOut(auth); } catch (error) { console.error("Erro ao fazer logout:", error); }
        navigate('/'); 
    };
    const toggleSidebar = () => { setIsSidebarOpen(!isSidebarOpen); };
  
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePictureUpload = async (e) => {
        if (!user || !user.uid) return;

        const file = e.target.files[0];
        if (!file) return;

        setSaveStatus('saving'); 
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePictureUrl(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            const storageRef = ref(storage, `advogados/${user.uid}/profilePicture_${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            setProfilePictureUrl(downloadURL);
            
            const docRef = doc(db, "advogados", user.uid);
            await updateDoc(docRef, { profilePictureUrl: downloadURL }, { merge: true });
            
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000); 

        } catch (error) {
            console.error("Erro no upload da foto ou salvamento no Firestore:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 5000); 
        }
    };


    const handleSaveProfile = async () => {
        if (!user) return;

        setSaveStatus('saving');
        try {
            const dataToSave = {
                nomeCompleto: profileData.nomeCompleto,
                telefone: profileData.telefone,
                especializacao: profileData.especializacao,
                profilePictureUrl: profilePictureUrl, 
            };

            const docRef = doc(db, "advogados", user.uid);
            await updateDoc(docRef, dataToSave);
            
            setAttorneyName(profileData.nomeCompleto);
            setIsEditingProfile(false);
            setSaveStatus('success');

            setTimeout(() => setSaveStatus(null), 3000); 
            
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 5000); 
        }
    };


    useEffect(() => { 
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(true);
                let determinedName = 'Advogado(a)';
                if (currentUser.displayName) {
                    determinedName = currentUser.displayName;
                } else if (currentUser.email) {
                    let emailPart = currentUser.email.split('@')[0];
                    determinedName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
                }
                
                try {
                    const docRef = doc(db, "advogados", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const nomeCompleto = data.nomeCompleto || determinedName;
                        setAttorneyName(nomeCompleto); 
                        setProfileData({
                            nomeCompleto: nomeCompleto,
                            telefone: data.telefone || '',
                            especializacao: data.especializacao || 'Direito Geral',
                        });
                        setProfilePictureUrl(data.profilePictureUrl || null); 
                    } else {
                        setAttorneyName(determinedName);
                        setProfileData(prev => ({ ...prev, nomeCompleto: determinedName }));
                        setProfilePictureUrl(null); 
                    }
                } catch (error) {
                    console.error("Erro ao carregar ou inicializar perfil do advogado:", error);
                    setAttorneyName(determinedName);
                }
            } else {
                setUser(null);
                setAttorneyName('Advogado(a)');
            }
            setLoading(false);
        });
        return () => unsubscribeAuth();
    }, [navigate]);
    
    useEffect(() => {
        if (user && db) {
            const qAgendamentos = query(collection(db, "agendamentos"), orderBy("timestamp", "desc"));
            const unsubscribeAgendamentos = onSnapshot(qAgendamentos, (querySnapshot) => {
                const fetchedAppointments = [];
                querySnapshot.forEach((doc) => {
                    fetchedAppointments.push({ id: doc.id, ...doc.data() });
                });
                setAgendamentos(fetchedAppointments);
            }, (error) => {
                console.error("Erro ao ouvir agendamentos:", error);
            });

            const qProcessos = query(collection(db, "processos"));
            const unsubscribeProcessos = onSnapshot(qProcessos, (querySnapshot) => {
                const fetchedProcesses = [];
                querySnapshot.forEach((doc) => {
                    fetchedProcesses.push({ id: doc.id, ...doc.data() });
                });
                setProcessos(fetchedProcesses);
            }, (error) => {
                 setProcessos([]); 
            });
            
            return () => {
                unsubscribeAgendamentos();
                unsubscribeProcessos();
            };
        }
        return () => {}; 
    }, [user]); 


    const menuItems = [
        { label: 'Dashboard', icon: <LayoutDashboard size={18} />, section: 'dashboard' },
        { label: 'Agendamentos', icon: <Mail size={18} />, section: 'agendamentos' },
        { label: 'Perfil', icon: <User size={18} />, section: 'perfil' },
        { label: 'Ajuda', icon: <HelpCircle size={18} />, section: 'ajuda' },
        { label: 'Configurações', icon: <Settings size={18} />, section: 'configuracoes' },
        { label: 'Sair', icon: <LogOut size={18} />, action: handleLogout, danger: true },
    ];
    


    const getStatusInfo = (status) => {
        switch (status) {
            case 'Pendente':
                return { color: colorPalette.danger, label: 'Pendente', actionLabel: 'Confirmar', actionIcon: <ClipboardCheck size={16} /> };
            case 'Confirmado': 
                return { color: colorPalette.secondary, label: 'Confirmado', actionLabel: 'Detalhes', actionIcon: <FileText size={16} /> };
            case 'Cancelado':
                return { color: colorPalette.warning, label: 'Cancelado', actionLabel: 'Reabrir?', actionIcon: <Mail size={16} /> };
            default:
                return { color: colorPalette.info, label: 'Em Análise', actionLabel: 'Detalhes', actionIcon: <FileText size={16} /> };
        }
    };
    
    const renderOverviewCards = () => {
        const pendingAppointments = agendamentos.filter(a => a.status === 'Pendente').length;
        const totalProcesses = processos.length;
        const pendingProcesses = processos.filter(p => p.status === 'Pendente' || p.status === 'Andamento').length;
        const processesWithDeadlineSoon = processos.filter(p => p.status !== 'Concluído' && p.prazo).length;

        const cardData = [
            {
                title: "Novos Agendamentos",
                value: pendingAppointments,
                icon: <Bell size={24} color={colorPalette.danger} />,
                subtitle: "Aguardando Confirmação",
                color: colorPalette.danger,
                bgColor: `${colorPalette.danger}11`,
            },
            {
                title: "Processos Ativos",
                value: pendingProcesses,
                icon: <Users size={24} color={colorPalette.info} />,
                subtitle: `De ${totalProcesses} Processos Totais`,
                color: colorPalette.info,
                bgColor: `${colorPalette.info}11`,
            },
            {
                title: "Prazos Próximos",
                value: processesWithDeadlineSoon,
                icon: <Calendar size={24} color={colorPalette.warning} />,
                subtitle: "Prioridade Imediata",
                color: colorPalette.warning,
                bgColor: `${colorPalette.warning}11`,
            },
            {
                title: "Processos Concluídos",
                value: processos.filter(p => p.status === 'Concluído').length,
                icon: <CheckCircle size={24} color={colorPalette.secondary} />,
                subtitle: "Total no Registo",
                color: colorPalette.secondary,
                bgColor: `${colorPalette.secondary}11`,
            },
        ];

        return (
            <div style={styles(colorPalette).overviewGrid}>
                {cardData.map((card, index) => (
                    <div key={index} style={{
                        ...styles(colorPalette).overviewCard,
                        borderLeft: `4px solid ${card.color}`,
                        backgroundColor: card.bgColor,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={styles(colorPalette).overviewTitle}>{card.title}</h4>
                            <div style={{ color: card.color }}>{card.icon}</div>
                        </div>
                        <p style={styles(colorPalette).overviewValue}>{card.value}</p>
                        <p style={styles(colorPalette).overviewSubtitle}>{card.subtitle}</p>
                    </div>
                ))}
            </div>
        );
    };

    const renderDashboardSummary = () => {
        const recentAppointments = agendamentos.filter(a => a.status === 'Pendente').slice(0, 3);
        
        return (
            <div style={styles(colorPalette).tableCard}>
                <h3 style={{...styles(colorPalette).mainTitleHeiMa, padding: 0, borderBottom: `1px solid ${colorPalette.border}`, paddingBottom: '10px', marginBottom: '15px'}}>
                    Novos Agendamentos Pendentes
                </h3>
                {recentAppointments.length === 0 ? (
                    <p style={{textAlign: 'center', padding: '20px', color: colorPalette.grayText}}>
                        Nenhum novo agendamento pendente no momento.
                    </p>
                ) : (
                    <div style={styles(colorPalette).summaryListWrapper}>
                        {recentAppointments.map((a) => {
                            const statusInfo = getStatusInfo(a.status);
                            return (
                                <div key={a.id} style={styles(colorPalette).summaryListItem}>
                                    <div style={{display: 'flex', alignItems: 'center', flexGrow: 1}}>
                                        <Mail size={20} color={colorPalette.primaryColor} style={{marginRight: '10px'}} />
                                        <div>
                                            <div style={{fontWeight: '600', color: colorPalette.text}}>{a.nomeCliente || 'Cliente Desconhecido'}</div>
                                            <div style={{fontSize: '0.85rem', color: colorPalette.grayText}}>{a.tipoConsulta || 'Consulta Geral'}</div>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        backgroundColor: statusInfo.color + '22', 
                                        color: statusInfo.color, 
                                        padding: '5px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.8rem', 
                                        fontWeight: '600',
                                        marginRight: '15px'
                                    }}>
                                        {statusInfo.label.toUpperCase()}
                                    </span>
                                    <button 
                                        onClick={() => setActiveSection('agendamentos')} 
                                        style={styles(colorPalette).summaryViewButton}
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div style={{marginTop: '20px', textAlign: 'right'}}>
                    <button 
                        onClick={() => setActiveSection('agendamentos')} 
                        style={styles(colorPalette).viewAllButton}
                    >
                        Ver Todos os Agendamentos <ArrowRight size={16} style={{marginLeft: '5px'}} />
                    </button>
                </div>
            </div>
        );
    };

    const AppointmentsTable = ({ data }) => {
        const filteredByStatus = currentFilter === 'All' ? data : data.filter(item => item.status === currentFilter);
        const filteredData = filteredByStatus.filter(item => 
            item.nomeCliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.emailCliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descricaoCaso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tipoConsulta?.toLowerCase().includes(searchTerm.toLowerCase()) 
        );
        
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            try {
                const date = new Date(dateString);
                if (!isNaN(date)) {
                    return date.toLocaleDateString('pt-PT', { year: 'numeric', month: '2-digit', day: '2-digit' });
                }
            } catch {}
            return dateString; 
        };


        return (
            <div style={styles(colorPalette).tableCard}>
                
                <div style={styles(colorPalette).tabBar}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {['All', 'Pendente', 'Confirmado', 'Cancelado'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setCurrentFilter(filter === 'All' ? 'All' : filter)}
                                style={filter === currentFilter ? styles(colorPalette).tabButtonActive : styles(colorPalette).tabButton}
                            >
                                {filter === 'All' ? 'Todos Agendamentos' : filter}
                            </button>
                        ))}
                    </div>
                    
                </div>
                
                <div style={styles(colorPalette).searchBar}>
                    <input
                        type="text"
                        placeholder="Nome do Cliente, E-mail, Tipo de Consulta, ou Palavra-chave do Caso..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles(colorPalette).searchInputHeiMaFull} 
                    />
                    
                    <button style={{...styles(colorPalette).searchButton, backgroundColor: colorPalette.primaryColor}}>
                        <Search size={18} style={{ marginRight: '5px' }} />
                        Buscar
                    </button>
                </div>

                <div style={styles(colorPalette).tableWrapper}>
                    <table style={styles(colorPalette).tableHeiMa}>
                        <thead>
                            <tr style={styles(colorPalette).tableHeadRowHeiMa}>
                                <th style={{ ...styles(colorPalette).tableHeadHeiMa, width: '25%' }}>Cliente (Caso)</th>
                                <th style={{ ...styles(colorPalette).tableHeadHeiMa, width: '20%' }}>Tipo de Consulta</th>
                                <th style={{ ...styles(colorPalette).tableHeadHeiMa, width: '15%' }}>Data Preferencial</th>
                                <th style={{ ...styles(colorPalette).tableHeadHeiMa, width: '15%' }}>Status</th>
                                <th style={{ ...styles(colorPalette).tableHeadHeiMa, width: '25%', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((a, index) => {
                                    const statusInfo = getStatusInfo(a.status);
                                    
                                    return (
                                        <tr key={a.id} style={styles(colorPalette).tableRowHeiMa}>
                                            <td style={styles(colorPalette).tableCellHeiMa}>
                                                <div style={{ fontWeight: '600', color: colorPalette.text }}>{a.nomeCliente || 'N/A'}</div>
                                                <div style={{ fontSize: '0.85rem', color: colorPalette.grayText, marginTop: '2px' }}>{a.descricaoCaso?.substring(0, 50) || 'N/A'}...</div>
                                            </td>
                                            <td style={styles(colorPalette).tableCellHeiMa}>{a.tipoConsulta || 'N/A'}</td>
                                            <td style={styles(colorPalette).tableCellHeiMa}>
                                                <Clock size={14} color={colorPalette.primaryColor} style={{ marginRight: '5px', display: 'inline' }} />
                                                {formatDate(a.dataPreferencial)}
                                            </td>
                                            <td style={styles(colorPalette).tableCellHeiMa}>
                                                <span style={{ 
                                                    backgroundColor: statusInfo.color + '22', 
                                                    color: statusInfo.color, 
                                                    padding: '5px 12px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: '600'
                                                }}>
                                                    {statusInfo.label.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={styles(colorPalette).tableCellHeiMa}>
                                                <div style={styles(colorPalette).actionButtonsGroup}>
                                                    <button style={{...styles(colorPalette).actionButtonHeiMa, backgroundColor: statusInfo.color}}>
                                                        {statusInfo.actionIcon}
                                                        {statusInfo.actionLabel}
                                                    </button>
                                                    <button style={styles(colorPalette).actionButtonReply}>
                                                        <MessageCircle size={16} />
                                                        Responder
                                                    </button>
                                                    {a.status !== 'Cancelado' && (
                                                        <button style={styles(colorPalette).actionButtonCancel}>
                                                            <XCircle size={16} />
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: colorPalette.grayText }}>
                                        Nenhum agendamento encontrado para os filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={styles(colorPalette).paginationBar}>
                    <span>Total: {filteredData.length} agendamentos</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[1].map(page => (
                            <button key={page} style={page === 1 ? styles(colorPalette).paginationButtonActive : styles(colorPalette).paginationButton}>
                                {page}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        );
    };

    const renderAppointmentsSection = () => {
        return (
            <>
                <h1 style={styles(colorPalette).mainTitleHeiMa}>Gestão de Agendamentos</h1>
                <p style={styles(colorPalette).mainSubtitleHeiMa}>Controle completo dos pedidos e status de atendimento.</p> 
                
                <AppointmentsTable data={agendamentos} />
            </>
        );
    };

    const renderProfileSection = () => (
        <div style={{...styles(colorPalette).tableCard, marginTop: '0'}}>
            <h3 style={{...styles(colorPalette).mainTitleHeiMa, padding: 0}}>Meu Perfil</h3>
            <p style={styles(colorPalette).mainSubtitleHeiMa}>Visualize e edite suas informações de contacto e especialização.</p>
            
            {saveStatus === 'success' && (
                <div style={{...styles(colorPalette).statusMessage, backgroundColor: colorPalette.secondary + '22', color: colorPalette.secondary}}>
                    <CheckCircle size={18} style={{marginRight: '10px'}}/> Perfil salvo com sucesso!
                </div>
            )}
            {saveStatus === 'error' && (
                <div style={{...styles(colorPalette).statusMessage, backgroundColor: colorPalette.danger + '22', color: colorPalette.danger}}>
                    <XCircle size={18} style={{marginRight: '10px'}}/> Erro ao salvar o perfil.
                </div>
            )}
            
            <div style={{paddingTop: '20px', borderTop: `1px solid ${colorPalette.border}`}}>
                
                {/* ÁREA DA FOTO DE PERFIL */}
                <h4 style={styles(colorPalette).formSectionTitle}>Foto de Perfil</h4>
                <div style={styles(colorPalette).photoArea}>
                    <div style={styles(colorPalette).photoContainer}>
                        {profilePictureUrl ? (
                            <img src={profilePictureUrl} alt="Foto de Perfil" style={styles(colorPalette).profileImage} />
                        ) : (
                            <User size={60} color={colorPalette.grayText} />
                        )}
                    </div>
                    {isEditingProfile && (
                        <>
                            <input 
                                type="file" 
                                id="profile-upload" 
                                accept="image/*"
                                onChange={handlePictureUpload} 
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="profile-upload" style={styles(colorPalette).uploadButton}>
                                <Download size={16} style={{marginRight: '8px'}} />
                                {profilePictureUrl ? "Alterar Foto" : "Carregar Foto"}
                            </label>
                        </>
                    )}
                </div>
 
               
                <h4 style={styles(colorPalette).formSectionTitle}>Informações Gerais</h4>
                <div style={styles(colorPalette).formGrid}>
                    <label style={styles(colorPalette).formLabel}>Nome Completo:
                        <input
                            type="text"
                            name="nomeCompleto"
                            value={profileData.nomeCompleto}
                            onChange={handleProfileChange}
                            style={styles(colorPalette).formInput}
                            disabled={!isEditingProfile}
                        />
                    </label>
                    <label style={styles(colorPalette).formLabel}>Email (Login):
                        <input
                            type="email"
                            value={user?.email || 'N/A'}
                            style={styles(colorPalette).formInput}
                            disabled 
                        />
                    </label>
                    <label style={styles(colorPalette).formLabel}>Telefone:
                        <input
                            type="text"
                            name="telefone"
                            value={profileData.telefone}
                            onChange={handleProfileChange}
                            style={styles(colorPalette).formInput}
                            disabled={!isEditingProfile}
                        />
                    </label>
                    <label style={styles(colorPalette).formLabel}>Especialização:
                        <select
                            name="especializacao"
                            value={profileData.especializacao}
                            onChange={handleProfileChange}
                            style={styles(colorPalette).formInput}
                            disabled={!isEditingProfile}
                        >
                            <option value="Direito Geral">Direito Geral</option>
                            <option value="Direito Familiar">Direito Familiar</option>
                            <option value="Direito Comercial">Direito Comercial</option>
                            <option value="Direito do Trabalho">Direito do Trabalho</option>
                        </select>
                    </label>
                </div>
                
                {/* BOTÕES DE AÇÃO */}
                <div style={{display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'flex-end'}}>
                    
                    {isEditingProfile ? (
                        <>
                            <button 
                                onClick={() => setIsEditingProfile(false)} 
                                style={{...styles(colorPalette).actionButtonReply, color: colorPalette.text, border: `1px solid ${colorPalette.border}`}}
                                disabled={saveStatus === 'saving'}
                            >
                                <XCircle size={16} style={{marginRight: '8px'}} />
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveProfile} 
                                style={{...styles(colorPalette).actionButtonHeiMa, backgroundColor: colorPalette.secondary}}
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'A Guardar...' : <><ClipboardCheck size={16} style={{marginRight: '8px'}} /> Guardar Alterações</>}
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsEditingProfile(true)} 
                            style={{...styles(colorPalette).actionButtonHeiMa, backgroundColor: colorPalette.primaryColor}}
                        >
                            <Edit size={16} style={{marginRight: '8px'}} />
                            Editar Perfil
                        </button>
                    )}
                </div>

            </div>
        </div>
    );

    const renderSettingsSection = () => (
        <>
            <h1 style={styles(colorPalette).mainTitleHeiMa}>Configurações</h1>
            <p style={styles(colorPalette).mainSubtitleHeiMa}>Personalize a experiência da sua área de trabalho.</p>
            
            <div style={{...styles(colorPalette).tableCard, padding: '20px', margin: '0 20px'}}>
                
                <h4 style={styles(colorPalette).formSectionTitle}>Preferências de Aparência</h4>
                <div style={styles(colorPalette).settingsItem}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        {theme === 'light' ? <Sun size={24} color={colorPalette.warning} /> : <Moon size={24} color={colorPalette.info} />}
                        <div>
                            <p style={styles(colorPalette).settingsTitle}>Tema da Aplicação</p>
                            <p style={styles(colorPalette).settingsSubtitle}>Alterne entre os modos Claro e Escuro.</p>
                        </div>
                    </div>
                    
                    <button onClick={toggleTheme} style={styles(colorPalette).themeToggleButton}>
                        {theme === 'light' ? (
                            <>
                                <Moon size={18} style={{marginRight: '8px'}} />
                                Modo Escuro
                            </>
                        ) : (
                            <>
                                <Sun size={18} style={{marginRight: '8px', color: colorPalette.warning}} />
                                Modo Claro
                            </>
                        )}
                    </button>
                </div>

                <h4 style={styles(colorPalette).formSectionTitle}>Notificações</h4>
                <div style={styles(colorPalette).settingsItem}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <Bell size={24} color={colorPalette.primaryColor} />
                        <div>
                            <p style={styles(colorPalette).settingsTitle}>Notificações do Sistema</p>
                            <p style={styles(colorPalette).settingsSubtitle}>Receber alertas por novos agendamentos e prazos.</p>
                        </div>
                    </div>
                    
                
                    <div 
                        onClick={() => handleSettingsChange('notifications', !notificationsEnabled)} 
                        style={{...styles(colorPalette).toggleContainer, backgroundColor: notificationsEnabled ? colorPalette.secondary : colorPalette.grayText}}
                    >
                        <div style={{...styles(colorPalette).toggleCircle, transform: notificationsEnabled ? 'translateX(24px)' : 'translateX(0)'}} />
                    </div>
                </div>

       

            </div>
        </>
    );

 
    const faqData = [
        { id: 1, question: "Como confirmo um novo agendamento?", answer: "Vá para a seção 'Agendamentos', filtre por 'Pendente' e clique no botão 'Confirmar' na linha do agendamento desejado. Uma notificação será enviada ao cliente." },
        { id: 2, question: "Onde vejo os prazos dos processos?", answer: "Na 'Dashboard', o cartão 'Prazos Próximos' mostra os processos com data de entrega futura. Para detalhes, a seção 'Processos' (a ser implementada) terá a lista completa." },
        { id: 3, question: "Posso mudar minha foto de perfil?", answer: "Sim. Vá para a seção 'Perfil', clique em 'Editar Perfil' e use o botão 'Carregar/Alterar Foto' para fazer o upload de uma nova imagem." },
    ];
    
    const renderHelpSection = () => (
        <>
            <h1 style={styles(colorPalette).mainTitleHeiMa}>Central de Ajuda & Suporte</h1>
            <p style={styles(colorPalette).mainSubtitleHeiMa}>Respostas rápidas para suas dúvidas e canais de contato.</p>
            
            <div style={{margin: '0 20px'}}>
                <div style={{...styles(colorPalette).tableCard, marginBottom: '20px'}}>
                    <h4 style={{...styles(colorPalette).formSectionTitle, borderBottom: `1px solid ${colorPalette.border}`}}>Perguntas Frequentes (FAQ)</h4>
                    {faqData.map((item) => (
                        <div key={item.id} style={styles(colorPalette).faqItem}>
                            <button 
                                onClick={() => handleFaqToggle(item.id)} 
                                style={styles(colorPalette).faqQuestionButton}
                            >
                                <span style={{fontWeight: '600', color: colorPalette.text}}>{item.question}</span>
                                {faqOpen === item.id ? <ChevronUp size={20} color={colorPalette.primaryColor} /> : <ChevronDown size={20} color={colorPalette.grayText} />}
                            </button>
                            {faqOpen === item.id && (
                                <div style={styles(colorPalette).faqAnswer}>
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={styles(colorPalette).tableCard}>
                    <h4 style={{...styles(colorPalette).formSectionTitle, borderBottom: `1px solid ${colorPalette.border}`}}>Fale Conosco (Suporte Técnico)</h4>
                    <form onSubmit={handleSupportSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        <label style={styles(colorPalette).formLabel}>Assunto:
                            <input
                                type="text"
                                value={supportMessage.subject}
                                onChange={(e) => setSupportMessage(prev => ({ ...prev, subject: e.target.value }))}
                                style={styles(colorPalette).formInput}
                                required
                            />
                        </label>
                        <label style={styles(colorPalette).formLabel}>Mensagem:
                            <textarea
                                value={supportMessage.body}
                                onChange={(e) => setSupportMessage(prev => ({ ...prev, body: e.target.value }))}
                                style={{...styles(colorPalette).formInput, minHeight: '100px'}}
                                required
                            />
                        </label>
                        <button type="submit" style={{...styles(colorPalette).actionButtonHeiMa, backgroundColor: colorPalette.primaryColor, alignSelf: 'flex-end', marginTop: '10px'}}>
                            <Send size={16} style={{marginRight: '8px'}} />
                            Enviar Pedido de Suporte
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
    
 
    const renderSection = () => {
        if (loading) {
            return <p style={{ color: colorPalette.primaryColor, padding: '20px' }}>A carregar dados...</p>;
        }

        switch (activeSection) {
            case 'dashboard':
                return (
                    <>
                        <h1 style={styles(colorPalette).mainTitleHeiMa}>Bem-vindo(a), {attorneyName}</h1>
                        <p style={styles(colorPalette).mainSubtitleHeiMa}>Visão Geral e Resumo das Atividades.</p>
                        
                        {renderOverviewCards()}

                        <div style={{marginTop: '30px', padding: '0 20px'}}>
                            {renderDashboardSummary()}
                        </div>
                    </>
                );
            case 'agendamentos':
                return renderAppointmentsSection();
            case 'perfil':
                return (
                    <div style={{padding: '0 20px'}}>
                        {renderProfileSection()}
                    </div>
                );
            case 'configuracoes':
                return renderSettingsSection();
            case 'ajuda':
                return renderHelpSection();
            default:
                return <p>Seção não encontrada.</p>;
        }
    };


    const dashboardLayout = {
        ...styles(colorPalette).dashboard,
        gridTemplateColumns: isSidebarOpen ? "250px 1fr" : "80px 1fr",
    };
    
    const sidebarStyle = {
        ...styles(colorPalette).sidebar,
        width: isSidebarOpen ? '250px' : '80px',
        alignItems: isSidebarOpen ? 'stretch' : 'center',
        backgroundColor: colorPalette.primaryColor, 
    };
    
    const getMenuItemStyle = (item) => ({
        ...styles(colorPalette).menuItem,
        color: activeSection === item.section ? colorPalette.primaryColor : colorPalette.lightText,
        backgroundColor: activeSection === item.section ? colorPalette.cardBackground : 'transparent',
        borderLeft: activeSection === item.section ? `4px solid ${colorPalette.cardBackground}` : 'none', 
        justifyContent: isSidebarOpen ? 'flex-start' : 'center',
    });


    return (
        <div style={dashboardLayout}>
            {/* SIDEBAR */}
            <aside style={sidebarStyle}>
                <div>
                    <div style={styles(colorPalette).sidebarHeader}>
                        {isSidebarOpen && <h2 style={styles(colorPalette).logo}><span style={{color: '#fff', fontWeight: 'bold'}}>IPAJ</span></h2>}
                        <button onClick={toggleSidebar} style={styles(colorPalette).toggleButton}>
                            <Menu size={24} color="#fff" />
                        </button>
                    </div>
                    
                    <ul style={styles(colorPalette).menu}>
                        {menuItems.map(item => (
                            <li 
                                key={item.label}
                                style={getMenuItemStyle(item)}
                                onClick={item.action || (() => setActiveSection(item.section))}
                            >
                                <span style={{ marginRight: isSidebarOpen ? '10px' : '0' }}>{item.icon}</span> 
                                {isSidebarOpen && item.label}
                                {isSidebarOpen && item.label === 'Agendamentos' && agendamentos.filter(a => a.status === 'Pendente').length > 0 && (
                                    <span style={styles(colorPalette).badge}>{agendamentos.filter(a => a.status === 'Pendente').length}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            <main style={styles(colorPalette).mainHeiMa}>
                {renderSection()}
            </main>
        </div>
    );
};



const styles = (colorPalette) => ({
    // ESTILOS GERAIS
    dashboard: {
        display: "grid",
        gridTemplateColumns: "250px 1fr",
        minHeight: "100vh",
        fontFamily: "Inter, 'Segoe UI', Arial, sans-serif", 
        backgroundColor: colorPalette.background, 
        transition: 'grid-template-columns 0.3s ease',
    },
    sidebar: {
        background: colorPalette.primaryColor, 
        color: colorPalette.lightText,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        overflowX: 'hidden',
        position: 'relative',
        transition: 'width 0.3s ease',
        paddingTop: '20px',
    },
    sidebarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: "0 20px 20px 20px",
        borderBottom: `1px solid rgba(255, 255, 255, 0.2)`,
        marginBottom: '20px',
    },
    toggleButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontSize: "1.6rem",
        color: colorPalette.lightText,
    },
    menu: { 
        listStyle: "none", 
        padding: 0,
        flexGrow: 1,
    },
    menuItem: {
        margin: "1px 0",
        cursor: "pointer",
        padding: "12px 20px",
        transition: "background-color 0.3s, color 0.3s, border-left 0.3s",
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        backgroundColor: colorPalette.danger,
        color: 'white',
        borderRadius: '50%',
        padding: '2px 8px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
  
    mainHeiMa: { 
        padding: "30px 0", 
        backgroundColor: colorPalette.background,
    },
    mainTitleHeiMa: { 
        fontSize: "1.7rem", 
        marginBottom: "5px", 
        color: colorPalette.text, 
        fontWeight: '700',
        padding: '0 20px', 
    },
    mainSubtitleHeiMa: { 
        marginBottom: "25px", 
        color: colorPalette.grayText,
        padding: '0 20px', 
    },

  
    overviewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
        padding: '0 20px',
    },
    overviewCard: {
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: colorPalette.cardBackground,
        boxShadow: `0 4px 15px ${colorPalette.text}08`, 
        transition: 'transform 0.2s',
    },
    overviewTitle: {
        fontSize: "1rem",
        color: colorPalette.text,
        fontWeight: '500',
        margin: 0,
    },
    overviewValue: {
        fontSize: "2.5rem",
        fontWeight: '700',
        color: colorPalette.text,
        margin: '10px 0 5px 0',
    },
    overviewSubtitle: {
        fontSize: '0.85rem',
        color: colorPalette.grayText,
        margin: 0,
    },
    

    summaryListWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
    },
    summaryListItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 10px',
        backgroundColor: colorPalette.cardBackground,
        borderBottom: `1px solid ${colorPalette.border}`,
        borderRadius: '4px',
        transition: 'background-color 0.2s',
    },
    summaryViewButton: {
        background: 'none',
        border: 'none',
        color: colorPalette.grayText,
        cursor: 'pointer',
        transition: 'color 0.2s',
    },
    viewAllButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 15px',
        backgroundColor: colorPalette.primaryColor + '11',
        color: colorPalette.primaryColor,
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'background-color 0.2s',
    },

  
    tableCard: {
        background: colorPalette.cardBackground,
        padding: "20px",
        borderRadius: "10px",
        boxShadow: `0 4px 15px ${colorPalette.text}08`, 
        marginTop: '20px',
    },


    tabBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${colorPalette.border}`,
        paddingBottom: '10px',
        marginBottom: '20px',
    },
    tabButton: {
        padding: '8px 15px',
        border: 'none',
        backgroundColor: 'transparent',
        color: colorPalette.grayText,
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    tabButtonActive: {
        padding: '8px 15px',
        border: 'none',
        backgroundColor: 'transparent',
        color: colorPalette.primaryColor, 
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        borderBottom: `2px solid ${colorPalette.primaryColor}`,
        marginBottom: '-11px', 
    },
    exportButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 15px',
        backgroundColor: colorPalette.primaryColor, 
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
    },

  
    searchBar: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        backgroundColor: colorPalette.lightBackground,
        padding: '15px',
        borderRadius: '8px',
        border: `1px solid ${colorPalette.border}`,
    },
    searchInputHeiMaFull: {
        padding: '10px 15px',
        border: `1px solid ${colorPalette.border}`,
        borderRadius: '5px',
        flexGrow: 1,
        fontSize: '0.95rem',
        outline: 'none',
        backgroundColor: colorPalette.cardBackground,
        color: colorPalette.text,
    },
    searchButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: colorPalette.primaryColor, 
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
    },

 
    tableWrapper: {
        overflowX: 'auto',
    },
    tableHeiMa: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 5px', 
    },
    tableHeadRowHeiMa: {
        backgroundColor: colorPalette.lightBackground,
        color: colorPalette.grayText,
        textAlign: 'left',
    },
    tableHeadHeiMa: {
        padding: '12px 15px',
        fontWeight: '600',
        fontSize: '0.9rem',
        borderBottom: `1px solid ${colorPalette.border}`,
    },
    tableRowHeiMa: {
        backgroundColor: colorPalette.cardBackground,
        boxShadow: `0 1px 3px ${colorPalette.text}08`,
        transition: 'box-shadow 0.2s',
    },
    tableCellHeiMa: {
        padding: '15px',
        color: colorPalette.text,
        fontSize: '0.95rem',
        verticalAlign: 'middle',
    },
    actionButtonsGroup: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonHeiMa: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    actionButtonReply: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: colorPalette.border,
        color: colorPalette.grayText,
        border: '1px solid ' + colorPalette.border,
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    actionButtonCancel: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: 'transparent',
        color: colorPalette.danger,
        border: '1px solid ' + colorPalette.danger + '44',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    

    paginationBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '20px',
        marginTop: '10px',
        borderTop: `1px solid ${colorPalette.border}`,
        color: colorPalette.grayText,
        fontSize: '0.9rem',
    },
    paginationButton: {
        padding: '8px 12px',
        border: `1px solid ${colorPalette.border}`,
        backgroundColor: colorPalette.cardBackground,
        color: colorPalette.grayText,
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    paginationButtonActive: {
        padding: '8px 12px',
        border: `1px solid ${colorPalette.primaryColor}`, 
        backgroundColor: colorPalette.primaryColor,
        color: '#fff',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    
  
    photoArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '30px',
        padding: '10px 0',
    },
    photoContainer: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: colorPalette.lightBackground,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        border: `3px solid ${colorPalette.primaryColor}`,
        flexShrink: 0,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    uploadButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        backgroundColor: colorPalette.info,
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'background-color 0.2s',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px',
        marginBottom: '20px',
    },
    formLabel: {
        display: 'flex',
        flexDirection: 'column',
        fontSize: '0.9rem',
        color: colorPalette.grayText,
        fontWeight: '500',
    },
    formInput: {
        padding: '10px 12px',
        border: `1px solid ${colorPalette.border}`,
        borderRadius: '5px',
        marginTop: '5px',
        fontSize: '0.95rem',
        backgroundColor: colorPalette.cardBackground,
        color: colorPalette.text,
        transition: 'border-color 0.2s',
    },
    formSectionTitle: {
        fontSize: '1.2rem',
        color: colorPalette.text,
        fontWeight: '600',
        marginTop: '25px',
        marginBottom: '15px',
        paddingBottom: '5px',
        borderBottom: `1px solid ${colorPalette.border}`,
    },
    statusMessage: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        borderRadius: '8px',
        fontWeight: '600',
        marginBottom: '20px',
        border: '1px solid currentColor',
    },
    
    
    settingsItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 0',
        borderBottom: `1px solid ${colorPalette.border}`,
    },
    settingsTitle: {
        fontWeight: '600',
        color: colorPalette.text,
        margin: 0,
    },
    settingsSubtitle: {
        fontSize: '0.85rem',
        color: colorPalette.grayText,
        margin: '3px 0 0 0',
    },
    themeToggleButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 15px',
        backgroundColor: colorPalette.lightBackground,
        color: colorPalette.text,
        border: `1px solid ${colorPalette.border}`,
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    toggleContainer: {
        width: '50px',
        height: '26px',
        borderRadius: '13px',
        padding: '2px',
        transition: 'background-color 0.3s',
        cursor: 'pointer',
        flexShrink: 0,
        position: 'relative',
    },
    toggleCircle: {
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        backgroundColor: colorPalette.cardBackground,
        transition: 'transform 0.3s',
    },
    
    // NOVOS ESTILOS PARA AJUDA/FAQ
    faqItem: {
        marginBottom: '10px',
        borderBottom: `1px solid ${colorPalette.border}`,
    },
    faqQuestionButton: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '15px 10px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background-color 0.2s',
    },
    faqAnswer: {
        padding: '10px 15px 20px 15px',
        backgroundColor: colorPalette.lightBackground,
        color: colorPalette.grayText,
        fontSize: '0.95rem',
        borderLeft: `3px solid ${colorPalette.primaryColor}`,
        margin: '0 0 10px 0',
    },
});


export default Advogado;
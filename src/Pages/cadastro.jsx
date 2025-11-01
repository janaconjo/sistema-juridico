import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Firebase/Firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [userType, setUserType] = useState('comum');

  const [nome, setNome] = useState('');
  const [emailReg, setEmailReg] = useState('');
  const [senhaReg, setSenhaReg] = useState('');
  const [confSenha, setConfSenha] = useState('');

  const [emailLog, setEmailLog] = useState('');
  const [senhaLog, setSenhaLog] = useState('');

  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nome || !emailReg || !senhaReg || !confSenha) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (senhaReg !== confSenha) {
      setError('As palavras-passe inseridas não coincidem.');
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailReg);
    if (!emailValid) {
      setError('O e-mail inserido não é válido.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailReg, senhaReg);
      const user = userCredential.user;

      await setDoc(doc(db, "utilizadores", user.uid), {
        nome,
        email: emailReg,
        tipo: userType,
        criadoEm: new Date().toISOString()
      });

      toast.success('Registo efetuado com sucesso! Já pode iniciar sessão.');
      setNome('');
      setEmailReg('');
      setSenhaReg('');
      setConfSenha('');
      setError('');
      setActiveTab('login');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está a ser utilizado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A palavra-passe é demasiado fraca.');
      } else {
        setError('Erro ao registar: ' + err.message);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailLog || !senhaLog) {
      setError('Preencha o e-mail e a palavra-passe.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailLog, senhaLog);
      const user = userCredential.user;

      const userRef = doc(db, "utilizadores", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        toast.success(`Bem-vindo, ${userData.nome}!`);

        if (userData.tipo === 'advogado') {
          navigate('/advogado');
        } else {
          navigate('/AgendarAtendimento');
        }
      } else {
        setError('Utilizador não encontrado na base de dados.');
      }

      setEmailLog('');
      setSenhaLog('');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('E-mail ou palavra-passe incorretos.');
      } else {
        setError('Erro ao iniciar sessão: ' + err.message);
      }
    }
  };

  useEffect(() => {
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`
      @keyframes fadeSlide {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `, styleSheet.cssRules.length);
  }, []);

  return (
    <div style={styles.wrapper}>
      <ToastContainer />
      <div style={styles.container}>
        <div style={styles.imageSection}>
          <h2 style={styles.title}>Bem-vindo(a)!</h2>
          <img src="src/assets/login.jpg" alt="Imagem" style={styles.image} />
          <div style={styles.welcomeText}>
            <p style={styles.subtitle}>A justiça é para todos.</p>
            <p style={styles.caption}>Crie a sua conta ou entre para continuar.</p>
          </div>
        </div>

        <div style={styles.formPanel}>
          <div style={styles.tabHeader}>
            <button onClick={() => { setActiveTab('register'); setError(''); }} style={{ ...styles.tabButton, ...(activeTab === 'register' ? styles.activeTab : {}) }}>Registar</button>
            <button onClick={() => { setActiveTab('login'); setError(''); }} style={{ ...styles.tabButton, ...(activeTab === 'login' ? styles.activeTab : {}) }}>Iniciar Sessão</button>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.sectionsContainer}>
            {/* FORM REGISTO */}
            <form onSubmit={handleRegister} style={{ ...styles.section, ...(activeTab === 'register' ? styles.visible : styles.hidden) }}>
              <h3 style={styles.sectionTitle}>Criar Conta</h3>
              <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} style={styles.input} />
              <input type="email" placeholder="E-mail" value={emailReg} onChange={(e) => setEmailReg(e.target.value)} style={styles.input} />
              <input type="password" placeholder="Palavra-passe" value={senhaReg} onChange={(e) => setSenhaReg(e.target.value)} style={styles.input} />
              <input type="password" placeholder="Confirmar palavra-passe" value={confSenha} onChange={(e) => setConfSenha(e.target.value)} style={styles.input} />
              <div style={styles.userTypeSelector}>
                <label>
                  <input type="radio" name="userType" value="comum" checked={userType === 'comum'} onChange={() => setUserType('comum')} />
                  Cidadão Comum
                </label>
                <label>
                  <input type="radio" name="userType" value="advogado" checked={userType === 'advogado'} onChange={() => setUserType('advogado')} />
                  Advogado
                </label>
              </div>
              <button type="submit" style={styles.submitButton}>Registar</button>
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
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(120deg, #61927dff, #ffffff)',
    zIndex: 999,
  },
  container: {
    display: 'flex',
    width: '800px',
    height: '500px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#fff',
  },
  imageSection: {
    flex: 1,
    backgroundColor: '#e0f7f4',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  image: {
    width: '100%',
    height: 'auto',
    maxWidth: '250px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  welcomeText: {
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1rem',
    margin: '10px 0',
  },
  caption: {
    fontSize: '0.9rem',
    color: '#666',
  },
  formPanel: {
    flex: 1.5,
    padding: '30px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeft: '2px solid #ddd',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    padding: '10px',
    border: 'none',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
    textAlign: 'center',
  },
  activeTab: {
    backgroundColor: '#008080',
    color: 'white',
  },
  sectionsContainer: {
    width: '100%',
  },
  section: {
    display: 'none',
    animation: 'fadeSlide 0.5s ease-out',
  },
  visible: {
    display: 'block',
  },
  hidden: {
    display: 'none',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#008080',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  userTypeSelector: {
    display: 'flex',
    justifyContent: 'space-around',
    margin: '10px 0',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
};

export default AuthForm;

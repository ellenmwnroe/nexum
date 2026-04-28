import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Bem-vindo ao Nexum</h1>
      <p>Inicie seu atendimento para que possamos entender o seu caso.</p>

      <button
        onClick={() => navigate('/triagem')}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '20px', marginRight: '8px' }}
      >
        Iniciar Triagem
      </button>

      <button
        onClick={() => navigate('/dashboard')}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '20px' }}
      >
        Ver Dashboard
      </button>
    </div>
  );
}

export default Home;

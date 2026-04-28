import { useEffect, useState } from 'react';

interface CaseItem {
  id: string;
  cliente_nome: string;
  tipo_caso: string;
  status: string;
}

function Dashboard() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const response = await fetch('http://localhost:3000/cases');

        if (!response.ok) {
          throw new Error('Não foi possível carregar os casos.');
        }

        const payload = await response.json();
        setCases(payload.data || []);
      } catch (err) {
        setError('Erro ao buscar casos no servidor.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard de Casos</h1>

      {loading && <p>Carregando casos...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <ul style={{ marginTop: '1.5rem', padding: 0, listStyle: 'none', display: 'grid', gap: '12px' }}>
          {cases.map((caseItem) => (
            <li key={caseItem.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
              <strong>Cliente:</strong> {caseItem.cliente_nome}<br />
              <strong>Tipo de caso:</strong> {caseItem.tipo_caso}<br />
              <strong>Status:</strong> {caseItem.status.toLowerCase()}
            </li>
          ))}
          {cases.length === 0 && <li>Nenhum caso encontrado.</li>}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;

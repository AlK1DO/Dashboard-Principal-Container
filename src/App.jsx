import React from 'react';
import PendingUsersPanel from './components/AccessControl/PendingUsersPanel';
import RequireProjectAccess from './components/AccessControl/RequireProjectAccess';

function App() {
  return (
    <div style={{ padding: '20px', background: '#0b0f19', minHeight: '100vh', color: '#fff' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1>Dashboard Principal - Módulo de Accesos</h1>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Panel de administración de usuarios pendientes */}
        <section>
          <h2>Gestión de Solicitudes</h2>
          <PendingUsersPanel />
        </section>

        <hr style={{ borderColor: '#1f293d' }} />

        {/* Ejemplo de protección de un proyecto específico */}
        <section>
          <h2>Vista de Proyecto Protegido</h2>
          <RequireProjectAccess projectId="proyecto-1">
            <div style={{ padding: '20px', background: '#111827', borderRadius: '8px', border: '1px solid #374151' }}>
              <h3>Contenido Confidencial: Proyecto 1</h3>
              <p>¡Felicidades! Tienes los permisos necesarios para visualizar este contenido.</p>
            </div>
          </RequireProjectAccess>
        </section>
      </main>
    </div>
  );
}

export default App;
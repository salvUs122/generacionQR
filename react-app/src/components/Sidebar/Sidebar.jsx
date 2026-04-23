import './Sidebar.css'

export function Sidebar({ activeView, onChangeView, onLogout, profileName }) {
  return (
    <aside className="sidebar">
      <p className="sidebar__eyebrow">paga tus facturas</p>
      <h2 className="sidebar__title">Portal cliente</h2>
      <p className="sidebar__profile">{profileName}</p>
      <button
        className={`sidebar__item ${activeView === 'dashboard' ? 'sidebar__item--active' : ''}`}
        type="button"
        onClick={() => onChangeView('dashboard')}
      >
        Dashboard
      </button>
      <button
        className={`sidebar__item ${activeView === 'qr' ? 'sidebar__item--active' : ''}`}
        type="button"
        onClick={() => onChangeView('qr')}
      >
        Pagar por QR
      </button>

      <button className="sidebar__logout" type="button" onClick={onLogout}>
        Cerrar sesion
      </button>
    </aside>
  )
}

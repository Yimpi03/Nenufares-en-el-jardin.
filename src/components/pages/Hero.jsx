import './Hero.css';

const Hero = () => {
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="kicker">JARDINES ACUÁTICOS · DESDE 2008</p>
        <h1 className="title">Flores que <span className="italic-pink">flotan</span><br />en el tiempo</h1>
        <p className="description">Nenúfares, lotos sagrados y peces koi de colección.<br />Cultivados con respeto por el agua y la vida.</p>
        <div className="buttons-group">
          <button 
            className="btn btn-primary"
            onClick={() => scrollToSection('productos')}
          >
            Explorar Colección
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => scrollToSection('eventos')}
          >
            Hacer Reserva
          </button>
        </div>
      </div>
      <div className="hero-visuals">
        <div className="images-container">
          <div className="img-placeholder loto"></div>
          <div className="img-placeholder koi"></div>
        </div>
        
        <div className="info-card">
          <p className="info-title">ENVÍO ESPECIAL</p>
          <p className="info-desc">Peces en bolsa de oxígeno · Plantas con raíz viva · 48 h garantizadas</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth';
import logo from '../assets/logo.png';
import heroImage from '../assets/hero_playful.png';
import featCommunity from '../assets/feat_community.png';
import featEco from '../assets/feat_eco.png';
import featOrg from '../assets/feat_org.png';

const LandingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] font-sans text-slate-900 selection:bg-[#FDE047] selection:text-[#7C3AED] overflow-x-hidden flex flex-col">

            {/* Background Decorations */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#FDE047]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 -z-10 pointer-events-none"></div>

            {/* Navbar */}
            <nav className="w-full px-4 py-6 md:px-8 max-w-7xl mx-auto flex justify-between items-center z-50">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Condiva" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                    <span className="font-black text-2xl tracking-tight text-[#7C3AED]">Condiva</span>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2.5 rounded-full font-bold text-slate-600 hover:text-[#7C3AED] hover:bg-[#F3E8FF] transition-colors"
                    >
                        Accedi
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="px-6 py-2.5 rounded-full font-bold bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm md:text-base whitespace-nowrap"
                    >
                        Registrati
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow">
                {/* Hero Section */}
                <header className="px-4 pt-8 pb-20 md:pt-16 md:pb-32 max-w-6xl mx-auto text-center relative">

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white border-2 border-[#FDE047] text-slate-800 font-bold text-sm mb-8 shadow-sm">
                            <span className="text-xl">👋</span> Ciao, benvenuto nel vicinato!
                        </span>

                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                            La tua community <br />
                            <span className="text-[#7C3AED] relative inline-block">
                                adora condividere
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FDE047] -z-10 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C2.00025 6.99997 101.5 0.5 198.5 2.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                            Smetti di comprare cose che userai una volta sola. Inizia a scambiare con i tuoi vicini e risparmia divertendoti!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full sm:w-auto px-8 py-4 bg-[#7C3AED] text-white font-bold rounded-full text-lg shadow-xl shadow-[#7C3AED]/30 hover:shadow-2xl hover:bg-[#6D28D9] hover:-translate-y-1 transition-all"
                            >
                                Inizia Gratis Ora
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-full text-lg shadow-md border border-slate-200 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all"
                            >
                                Ho già un account
                            </button>
                        </div>
                    </div>

                    {/* Static Hero Image */}
                    <div className="relative max-w-3xl mx-auto px-4">
                        <div className="absolute inset-0 bg-[#7C3AED] rounded-[3rem] rotate-2 opacity-10 blur-2xl"></div>
                        <img
                            src={heroImage}
                            alt="Community sharing illustration"
                            className="relative z-10 w-full rounded-[2.5rem] shadow-2xl border-4 border-white bg-white select-none pointer-events-none"
                        />
                    </div>
                </header>

                {/* Features Section */}
                <section className="px-4 py-20 bg-white relative overflow-hidden">
                    <div className="max-w-6xl mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
                                Semplice come un <span className="text-[#F59E0B]">sorriso</span>
                            </h2>
                            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                                Condiva è progettato per rendere la condivisione naturale e immediata.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                            <FeatureCard
                                image={featCommunity}
                                title="Community Locali"
                                description="Scambia con persone vere che vivono vicino a te. Più sicurezza, meno viaggi."
                                colorName="purple"
                            />
                            <FeatureCard
                                image={featEco}
                                title="Impatto Reale"
                                description="Ogni oggetto condiviso è un oggetto in meno da produrre, trasportare e smaltire."
                                colorName="green"
                            />
                            <FeatureCard
                                image={featOrg}
                                title="Zero Stress"
                                description="Tieni traccia di chi ha cosa. Scadenze e prestiti sempre sotto controllo."
                                colorName="yellow"
                            />
                        </div>
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="bg-[#F8FAFC] py-12 px-4 border-t border-slate-100 mt-auto">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 mb-6 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default select-none pointer-events-none">
                        <img src={logo} alt="Condiva" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-slate-700">Condiva</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                        La piattaforma di sharing economy per community felici. <br />
                        Fatto con 💜 per un futuro sostenibile.
                    </p>
                    <p className="text-slate-400 text-xs">
                        &copy; {new Date().getFullYear()} Condiva
                    </p>
                </div>
            </footer>
        </div>
    );
};

// Simplified Feature Card (Non-interactive look)
const FeatureCard = ({ image, title, description, colorName }: any) => {
    // Color mapping
    const colors: Record<string, string> = {
        purple: "bg-[#F3E8FF] text-[#7C3AED]",
        green: "bg-[#DCFCE7] text-[#15803D]",
        yellow: "bg-[#FEF9C3] text-[#B45309]",
    };

    const style = colors[colorName] || colors.purple;

    return (
        <div className="flex flex-col items-center text-center">
            <div className={`mb-6 p-8 w-full aspect-square rounded-[2rem] flex items-center justify-center ${style.split(' ')[0]} bg-opacity-50 select-none pointer-events-none`}>
                <img src={image} alt={title} className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-slate-900">{title}</h3>
            <p className="text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">{description}</p>
        </div>
    );
};

export default LandingPage;

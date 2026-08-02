import React from 'react';

export const VisualBanner: React.FC = () => {
  return (
    <section className="bg-slate-50 py-10 overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Le pont entre les talents et les entreprises
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto">
            Découvrez un écosystème dynamique où les jeunes professionnels et les recruteurs se rencontrent sans barrières.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group overflow-hidden rounded-2xl shadow-md h-64 md:h-80">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Jeunes professionnels au travail" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
              <h3 className="text-white font-bold text-lg">Travail d'équipe</h3>
            </div>
          </div>
          
          <div className="relative group overflow-hidden rounded-2xl shadow-md h-64 md:h-80 md:-translate-y-4">
            <img 
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Entretien et poignée de main" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
              <h3 className="text-white font-bold text-lg">Opportunités & Recrutement</h3>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl shadow-md h-64 md:h-80">
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Bureau moderne et innovation" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
              <h3 className="text-white font-bold text-lg">Innovation</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

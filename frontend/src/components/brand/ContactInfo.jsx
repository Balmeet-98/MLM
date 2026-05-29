export const CONTACT = {
  email: 'samriddhinetwork349@gmail.com',
  phones: ['9419185768', '9541608725'],
  address: 'Opp. General Bus Stand, B.C. Road, Jammu',
};

function IconCircle({ children, small = false }) {
  return (
    <span className={`flex-shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-white ${small ? 'w-6 h-6' : 'w-8 h-8'}`}>
      {children}
    </span>
  );
}

function MailIcon({ small = false }) {
  return (
    <svg className={small ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon({ small = false }) {
  return (
    <svg className={small ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

export default function ContactInfo({ variant = 'default', className = '', light = false }) {
  const textClass = light ? 'text-white' : 'text-slate-800';
  const linkClass = light
    ? 'text-white hover:text-amber-200 font-semibold'
    : 'text-slate-800 hover:text-brand-600 font-semibold';
  const emailLinkClass = light
    ? 'text-white/95 hover:text-amber-200'
    : 'text-slate-800 hover:text-brand-600';

  if (variant === 'compact') {
    return (
      <p className={`text-xs leading-relaxed ${light ? 'text-orange-200' : 'text-slate-500'} ${className}`}>
        {CONTACT.address}
        {' · '}
        <a href={`tel:${CONTACT.phones[0]}`} className={light ? 'hover:underline' : 'hover:text-brand-600'}>
          {CONTACT.phones[0]}
        </a>
        {', '}
        <a href={`tel:${CONTACT.phones[1]}`} className={light ? 'hover:underline' : 'hover:text-brand-600'}>
          {CONTACT.phones[1]}
        </a>
        {' · '}
        <a href={`mailto:${CONTACT.email}`} className={light ? 'hover:underline' : 'hover:text-brand-600'}>
          {CONTACT.email}
        </a>
      </p>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs ${className}`}>
        <a href={`mailto:${CONTACT.email}`} className={`inline-flex items-center gap-1.5 ${emailLinkClass}`}>
          <IconCircle small><MailIcon small /></IconCircle>
          {CONTACT.email}
        </a>
        <span className={`inline-flex items-center gap-1.5 ${linkClass}`}>
          <IconCircle small><PhoneIcon small /></IconCircle>
          {CONTACT.phones.map((phone, i) => (
            <span key={phone}>
              {i > 0 && <span className={light ? 'text-white/70' : 'text-slate-400'}>, </span>}
              <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
            </span>
          ))}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <a
        href={`mailto:${CONTACT.email}`}
        className={`flex items-center gap-3 text-sm sm:text-base ${emailLinkClass} transition-colors`}
      >
        <IconCircle><MailIcon /></IconCircle>
        <span>{CONTACT.email}</span>
      </a>
      <div className={`flex items-center gap-3 text-sm sm:text-base ${textClass}`}>
        <IconCircle><PhoneIcon /></IconCircle>
        <p className={`font-semibold m-0 ${linkClass}`}>
          {CONTACT.phones.map((phone, i) => (
            <span key={phone}>
              {i > 0 && <span className={light ? 'text-white/70 font-normal' : 'text-slate-400 font-normal'}>, </span>}
              <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

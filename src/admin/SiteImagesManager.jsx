import { useState } from 'react';
import AdminIcon from './AdminIcon';
import { Dropzone } from './AdminUI';
import { processImage, setSiteImage } from '../services/contentStore';

const SLOTS = [
  {
    id: 'promoImage',
    title: 'Homepage Promo Image',
    where: 'Homepage → "Grow Your Business Online" banner',
    size: 'Recommended 1200 × 900',
    fallback: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=70',
  },
  {
    id: 'aboutImage',
    title: 'About Us Image',
    where: 'Homepage → "About AfricaFuture" section',
    size: 'Recommended 1200 × 1400 (portrait)',
    fallback: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=70',
  },
  {
    id: 'contactImage',
    title: 'Contact Page Image',
    where: 'Contact page → next to the contact form',
    size: 'Recommended 1000 × 1200 (portrait)',
    fallback: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=70',
  },
];

function SiteImagesManager({ siteImages, toast, confirm }) {
  const [busy, setBusy] = useState(null);

  const replace = async (slot, [file]) => {
    setBusy(slot.id);
    try {
      await setSiteImage(slot.id, await processImage(file, { maxSize: 1800 }));
      toast(`${slot.title} updated`);
    } catch (err) {
      toast(err.message, 'error');
    }
    setBusy(null);
  };

  const reset = async (slot) => {
    const ok = await confirm({
      title: 'Restore default image?',
      text: `${slot.title} will go back to the original image.`,
      confirmText: 'Restore default',
    });
    if (!ok) return;
    await setSiteImage(slot.id, null);
    toast(`${slot.title} restored to default`);
  };

  return (
    <div className="adm-stack">
      <div className="adm-alert adm-alert--info">
        Replace the main images used on your website. You can always restore the original image.
      </div>
      <div className="adm-slots">
        {SLOTS.map((slot) => {
          const custom = siteImages[slot.id];
          return (
            <section key={slot.id} className="adm-card adm-slot">
              <div className="adm-slot-preview">
                <img src={custom || slot.fallback} alt={slot.title} />
                <span className={`adm-slot-flag ${custom ? 'is-custom' : ''}`}>{custom ? 'Custom' : 'Default'}</span>
                {busy === slot.id && (
                  <div className="adm-slot-busy">
                    <span className="adm-spinner" />
                  </div>
                )}
              </div>
              <div className="adm-slot-body">
                <h3>{slot.title}</h3>
                <p className="adm-muted">{slot.where}</p>
                <p className="adm-hint">{slot.size}</p>
                <Dropzone onFiles={(f) => replace(slot, f)} multiple={false} compact label="Upload new image" />
                {custom && (
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--block" onClick={() => reset(slot)}>
                    <AdminIcon name="refresh" size={15} /> Restore default
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default SiteImagesManager;

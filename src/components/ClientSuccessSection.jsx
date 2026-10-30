import { CLIENT_STORIES } from '../data/landingData';

function ClientSuccessSection({ onSelectStory }) {
  return (
    <section id="client-success" className="client-success-section">
      <div className="container">
        <h2 className="client-success-heading reveal">Client Success</h2>

        <div className="client-success-grid">
          {CLIENT_STORIES.map((story, idx) => (
            <article
              key={story.id}
              className={`client-story-card reveal delay-${idx + 1}`}
            >
              <div className="story-image-wrap">
                <img src={story.image} alt={story.title} loading="lazy" />
              </div>

              <div className="story-white-box">
                <div>
                  <div className="story-eyebrow">{story.eyebrow}</div>
                  <h3 className="story-title">{story.title}</h3>
                </div>

                <div>
                  <button
                    className="btn-orange"
                    style={{ padding: '10px 22px', fontSize: '0.88rem' }}
                    onClick={() => onSelectStory(story)}
                  >
                    Read the Story
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClientSuccessSection;


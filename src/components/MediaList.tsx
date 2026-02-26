import { Media } from "@moojor224/tba-api";

export default function MediaList({ media }: { media: Media | Media[] }) {
    if (!Array.isArray(media)) {
        media = [media];
    }
    return (
        <div>
            {media.map((e, i) => (
                <MediaDisplay key={i} media={e} />
            ))}
        </div>
    );
}

function MediaDisplay({ media }: { media: Media }) {
    return <div></div>;
}

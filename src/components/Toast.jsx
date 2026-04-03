export default function Toast({ message, visible }) {
    return (
        <div className={`toast ${visible ? 'visible' : ''}`}>
            ✓ Copied <strong>{message}</strong>
        </div>
    );
}

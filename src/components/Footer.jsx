import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      &copy; {new Date().getFullYear()}
    </footer>
  );
}


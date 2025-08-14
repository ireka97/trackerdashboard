import Eiger from "../../assets/sponsor/eiger.png"
import Arei from "../../assets/sponsor/arei.png"
import Cozmeed from "../../assets/sponsor/cozmeed.png"
import "./footer.css"
export default function Footer() {
 return (
  <footer className="dashboard-footer">
   {/* <div className="footer-content">
    <h2 className="supported-tittle">Di Dukung Oleh:</h2>
    <div className="sponsor-wrapper">
     <div className="sponsor-content">
      <img src={Eiger} />
     </div>
     <div className="sponsor-content">
      <img src={Arei} />
     </div>
     <div className="sponsor-content">
      <img src={Cozmeed} />
     </div>
    </div>
   </div> */}
   <div className="copyright">
    <p>© {new Date().getFullYear()} dashboard admin tracker.</p>
   </div>
  </footer>
 )
}

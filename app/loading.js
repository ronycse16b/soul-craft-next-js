import { HashLoader } from "react-spinners";


export default function loading() {
  return (
    <div className="min-h-[80vh] flex justify-center items-center ">
      <HashLoader color="#e50000" size={50} />
    </div>
  );
}

import EmployerNavbar from "./EmployerNavbar"


const EmployerDashboard = () => {


  const handleMessageState = (data) => {
    setMessages(data);
  };

  return (
    <div>
      <EmployerNavbar messageState={handleMessageState}/>
    </div>
  )
}

export default EmployerDashboard

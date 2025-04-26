import React from "react";
import { ProPopup } from "zyra";

const proPopupContent = {
    proUrl: appLocalizer.pro_url,
    title: "Boost to Product Stock Manager & Notifier Pro to access premium features!",
    messages: ["Double Opt-in.", "Ban Spam Mail.", "Export Subscribers.", "Subscription Dashboard.", "MailChimp Integration.", "Recaptcha Support.", "Subscription Details.", "Stock Manager Dashboard.", "Export/Import Stock."],
}


const ShowProPopup: React.FC = () => {
  return (<ProPopup {...proPopupContent} />);
}

export default ShowProPopup
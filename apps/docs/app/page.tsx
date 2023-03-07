import { If } from "@accio-ui/react-tsx";
import { IFExample } from "./if-examples";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1>{"<If />"}</h1>
      <IFExample />
    </div>
  );
}

import { HomeBox } from "./Component/HomeBox/homeBox";
import { HOME_BOX_CONST } from "./Component/HomeBox/homeBoxConstatants";

export default function Home() {
  return (
    <div>
      <HomeBox data={HOME_BOX_CONST[0]} />
      <HomeBox data={HOME_BOX_CONST[1]} />
    </div>
  );
}

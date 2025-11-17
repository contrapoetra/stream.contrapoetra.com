import VideoPlayer from '../components/VideoPlayer';
import VideoThumbnail from '../components/VideoThumbnail';
import UserComment from '../components/UserComment';
import { useSearchParams } from 'react-router-dom';

interface PlayerProps {
  videoId?: string;
  title: string;
  channel: string;
}

const margin = 12;

function Player() {
  const [searchParams] = useSearchParams();
  const title = searchParams.get('title');
  const channel = searchParams.get('channel');

  return (
    <div id="player" className="flex w-full h-full">
      <div id="content" className="flex flex-col w-3/4">
        <div id="video" className={`flex shrink-0 ml-${margin} mt-5 mb-5 rounded-xl overflow-hidden`}>
          {/* Placeholder */}
          <VideoPlayer/>
        </div>
        <div id="title" className={`flex ml-${margin} text-3xl font-bold`}>{title}</div>
        <div id="channel" className={`flex ml-${margin} mt-3`}>{channel}</div>
        <div id="subscribers" className={`flex ml-${margin} text-sm text-neutral-500`}>1 subscribers</div>
        <div id="description" className={`flex ml-${margin} mt-5 bg-neutral-100 outline-neutral-200 outline-1 p-4 rounded-xl`}>
          {/* Placeholder */}
          Hey guys what's up this is an animation I directed, with the help of Yuemichi, and other people I forgot their names haha, enjoy! lksdjflksdjfkldsj fklsdjf lkdsjf lkds fklds fkljsdflkdsj fkldsjfksdjfj lksd jflksdjf lkdsjfl ksdjfk ljsdfkl jlsdk fjlksdjflkjdslkf lksd flksjdflkj dslkfjlksdjf lksdj flkdsjf lksj
        </div>
        <div className={`text-2xl font-bold ml-${margin} mt-5`}>Comments</div>
        <div id="comments" className={`flex flex-col ml-${margin} mt-5`}>
          {/* Placeholder */}
          <UserComment user="yuemichi" comment="this is so ass bro!!! 🥀" />
          <UserComment user="sunnydrop" comment="ngl this kinda ate?? ✨" />
          <UserComment user="voidling" comment="bro what did my eyes just witness 😭😭" />
          <UserComment user="peachmoss" comment="ok but why is nobody talking about how cute this is??" />
          <UserComment user="crankedsoda" comment="this feels like a crime but I'm lowkey entertained" />
          <UserComment user="m1dn1ght" comment="I’m not saying it’s bad but… actually yeah it’s bad 💀" />
          <UserComment user="ghosttoast" comment="chef’s kiss, keep going king/queen/non-royalty 👑" />
          <UserComment user="trashfire" comment="this belongs in a museum labeled ‘please don’t touch or look at it’ 😭" />
          <UserComment user="mintyfresh" comment="you tried and honestly that’s kinda wholesome 🫶" />
          <UserComment user="pixelgremlin" comment="why does this go so hard for no reason??" />
          <UserComment user="ratmode" comment="I opened this and my phone immediately lost battery 💀🔋" />
          <UserComment user="cloudberry" comment="I actually love this sm, don’t listen to anyone 😤" />
          <UserComment user="brickhouse" comment="bro I’ve seen loading screens with more personality" />
          <UserComment user="starlitwing" comment="this has so much potential, keep at it!" />
          <UserComment user="glitchsniff" comment="my disappointment is measurable and my day is ruined 💔" />
          <UserComment user="puddlejumper" comment="aww this is adorable, keep going!" />
        </div>
      </div>
      <div id="sidebar" className="w-1/4 h-full mt-5">
        <VideoThumbnail title="How I Accidentally Broke the Internet" channel="TechGoblin" />
        <VideoThumbnail title="10-Min Speedrun of Absolute Nonsense" channel="ChaosCentral" />
        <VideoThumbnail title="Why My Cat Hates Gravity" channel="FelixFiles" />
        <VideoThumbnail title="Making a Sandwich Blindfolded (Disaster)" channel="SnackAttackTV" />
        <VideoThumbnail title="I Tried Learning Piano in 24 Hours" channel="NoteNerd" />
        <VideoThumbnail title="The Deep Lore Behind My Toaster" channel="ApplianceLore" />
        <VideoThumbnail title="Ranking Every Cereal From Painful to Legendary" channel="BreakfastBros" />
        <VideoThumbnail title="Reacting to My Old Cringe Posts" channel="VintageEmbarrassment" />
        <VideoThumbnail title="I Turned My Room Into a Jungle" channel="LeafLord" />
        <VideoThumbnail title="You Won’t Believe What’s Under My Bed" channel="MysteryMuncher" />
        <VideoThumbnail title="Trying Viral TikTok Hacks So You Don’t Have To" channel="HackOrWack" />
        <VideoThumbnail title="I Built a PC Out of Pure Spite" channel="SaltyEngineer" />
        <VideoThumbnail title="The Day My Dog Learned Betrayal" channel="PawDrama" />
        <VideoThumbnail title="Is Water Wet? A Scientific Meltdown" channel="BrainCellMinusOne" />
        <VideoThumbnail title="This Game Made Me Question Reality" channel="PixelPanic" />
      </div>
    </div>
  );
}

export default Player;

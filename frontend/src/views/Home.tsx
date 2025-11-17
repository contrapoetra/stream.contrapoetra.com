import VideoThumbnail from '../components/VideoThumbnail';
import { DarkModeContext } from '../context/DarkModeContext';
import { useContext } from 'react';

function Home() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <>
      <div className={`${darkMode ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-black'} flex w-full h-full`}>
        <div id="sidebar" className={`${darkMode ? 'bg-neutral-950' : 'bg-neutral-50'} w-1/5 h-full text-2xl`}>
          sidebar
        </div>
        <div className="flex flex-col w-full">
          <div id="content" className={`w-full grid grid-cols-3 gap-0`}>
            <VideoThumbnail title="Steadfast (Dimas Atha Putra, 2024)" channel="contrapoetra" />
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
      </div>
    </>
  )
}

export default Home;

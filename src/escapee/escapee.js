import './escapee.css';
import { LOGO_URL } from '../assets/logo-url.js';

const STUDIO = "D'SAITECH";

// Follow the theme the player picked on the main menu (same localStorage key as the game).
try {
  const t = localStorage.getItem('lockdown_theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch {}

// The Escapee never sees the rules. This page only says how to describe things and how to operate each lock.
document.getElementById('root').innerHTML = `
  <div class="grain"></div><div class="rec"><i></i><span>REC · ESCAPEE CAM</span></div>
  <a class="back" href="/">← MAIN MENU</a>
  <header class="hero">
    <img class="logo" src="${LOGO_URL}" alt="${STUDIO} logo" draggable="false">
    <h1>YOU ARE THE ESCAPEE</h1>
    <p class="tag">BLACKTHORN MANOR · ESCAPEE'S INSTRUCTIONS</p>
  </header>

  <section class="card rule">
    <h2>THE ONE RULE</h2>
    <p><b>You have no manual. Your partner does.</b> They are the Handler. They cannot see your screen, so you are their eyes. Describe everything. Do as you are told. Do not guess.</p>
  </section>

  <section class="card">
    <h2>BEFORE YOU START</h2>
    <ol>
      <li>Sit so your partner <b>cannot see your phone</b>.</li>
      <li>Tap <b>ENTER THE HOUSE</b>. The clock starts at once.</li>
      <li>Read your <b>CASE CODE</b> aloud as four fields: <b>LETTER, SERIAL, ROOM, COLOR</b>. Example: "K, 7, room 3, red".</li>
      <li>Read the <b>PLATE NAME</b> on the door. Say it exactly, every word.</li>
    </ol>
  </section>

  <section class="card">
    <h2>YOUR JOB, EVERY DOOR</h2>
    <ol>
      <li><b>Read the plate name</b> aloud. Similar names mean different locks.</li>
      <li><b>Describe what you see</b>. Answer their questions. Number things the way the screen does.</li>
      <li><b>Wait</b> for one clear instruction. Do it. Say "done".</li>
      <li>Never tap on your own. A wrong tap is a strike.</li>
      <li>The door opens. Read the next plate name. Repeat.</li>
    </ol>
  </section>

  <h2 class="sec">THE FOUR LOCKS</h2>

  <section class="card lock">
    <div class="plate">BRASS TUMBLER</div>
    <p class="see"><b>You see:</b> a row of pins. Each has a number, a color and a symbol.</p>
    <p class="say"><b>Tell them:</b> for each pin from the left: its number, its color, and whether it shows a <b>skull</b>. Say "no skull" if none does.</p>
    <p class="do"><b>You do:</b> tap the pins in the exact order they give you.</p>
  </section>

  <section class="card lock">
    <div class="plate">GLYPH PAD</div>
    <p class="see"><b>You see:</b> four carved marks on four keys.</p>
    <p class="say"><b>Tell them:</b> what each mark looks like, one at a time. Use shapes: "a circle with a dot", "a trident". Mention if the marks look alike.</p>
    <p class="do"><b>You do:</b> press the keys in the order they give you, by shape.</p>
  </section>

  <section class="card lock">
    <div class="plate">FUSE BOX</div>
    <p class="see"><b>You see:</b> a set of wires from top to bottom. Each has a number and a color. Some have a <b>paper tag</b> with a word on it. The rest say <b>NO TAG</b>.</p>
    <p class="say"><b>Tell them:</b> how many wires there are. Then, top to bottom: the color, and "tag" or "no tag". For a tag, read the word aloud.</p>
    <p class="do"><b>You do:</b> cut only the wire they name. One cut.</p>
  </section>

  <section class="card lock">
    <div class="plate">EXECUTION SWITCH</div>
    <p class="see"><b>You see:</b> six lettered switches and a countdown that loops from 20 to 0.</p>
    <p class="say"><b>Tell them:</b> the letters, left to right. Then wait for their call.</p>
    <p class="do"><b>You do:</b> they name a switch and a number. Put your finger over that switch, watch the countdown, and flip it <b>as the number appears</b>. The window is about one second. The countdown does not wait. If you miss it, say so and let it come around again only if they tell you to.</p>
    <p class="warn">Flip once. Early, late, or the wrong switch is a strike.</p>
  </section>

  <section class="card">
    <h2>STRIKES AND THE CLOCK</h2>
    <p>You have <b>4:00</b>. Every wrong move is a <b>strike</b>: <b>15 seconds</b> off the clock, a loud noise, and he steps closer. <b>Three strikes, or zero seconds, and he finds you.</b> Open all four doors to escape.</p>
    <p>The <b>MENU</b> button leaves a run. It asks first, and the clock waits while you decide.</p>
  </section>

  <section class="card">
    <h2>TALK LIKE A PRO</h2>
    <ul>
      <li>Spell letters with a word: "B as in Bravo". B and D, M and N sound alike.</li>
      <li>Describe, do not decide. Say what is there, not what you think it means.</li>
      <li>Say "done" after every action so the Handler knows to move on.</li>
      <li>Something scary happens? Keep talking. Calm beats fast.</li>
      <li>Too intense? Turn on <b>GENTLE MODE</b> on the main menu before you enter.</li>
    </ul>
  </section>

  <a class="go" href="/">← BACK TO MAIN MENU</a>
  <footer><span>A game by <b>${STUDIO}</b></span></footer>
`;

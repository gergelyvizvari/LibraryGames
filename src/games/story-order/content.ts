import type { Locale } from '../../i18n'

export interface Step {
  emoji: string
  text: string
}

export interface Story {
  steps: Step[]
  minLevel: number
  maxLevel: number
}

/** Three-step stories for the youngest, four-step ones later; the short ones leave after level 5. */
const LEVELS = { 3: [1, 5], 4: [4, 10] } as const

const s = (...steps: [string, string][]): Story => {
  const [minLevel, maxLevel] = LEVELS[steps.length as 3 | 4]
  return { steps: steps.map(([emoji, text]) => ({ emoji, text })), minLevel, maxLevel }
}

/** Every story has one clear order: each step can only happen after the one before it. */
export const stories: Record<Locale, Story[]> = {
  en: [
    s(['🌰', 'Plant a seed.'], ['🌱', 'It starts to grow.'], ['🌻', 'A big flower!']),
    s(['🥚', 'Here is an egg.'], ['🐣', 'It cracks open.'], ['🐥', 'Peep! A chick!']),
    s(['❄️', 'Snow falls.'], ['⛄', 'We build a snowman.'], ['💧', 'The sun melts it.']),
    s(['🥣', 'Mix the batter.'], ['🔥', 'Bake it in the oven.'], ['🎂', 'The cake is ready!']),
    s(['🛁', 'Run the bath.'], ['🧽', 'Scrub, scrub!'], ['😊', 'All clean!']),
    s(['☁️', 'Dark clouds come.'], ['🌧️', 'It rains.'], ['🌈', 'A rainbow!']),
    s(['🐛', 'A little caterpillar.'], ['🍃', 'It eats lots of leaves.'], ['🦋', 'Now it is a butterfly!']),
    s(['🪥', 'Get your toothbrush.'], ['🦷', 'Brush your teeth.'], ['😁', 'Shiny teeth!']),
    s(['🎈', 'Blow up a balloon.'], ['📌', 'Oh no, a pin!'], ['💥', 'Pop!']),
    s(['🍦', 'Buy an ice cream.'], ['☀️', 'The sun is very hot.'], ['💦', 'It melts!']),
    s(['⏰', 'The alarm rings.'], ['🥱', 'Wake up and yawn.'], ['🥣', 'Eat breakfast.']),
    s(['📖', 'Read a story.'], ['💡', 'Turn off the light.'], ['😴', 'Sleep tight.']),
    s(['✉️', 'Write a letter.'], ['📮', 'Post it.'], ['📬', 'It arrives!']),
    s(['🎣', 'Throw in the line.'], ['🐟', 'A fish bites!'], ['🪣', 'Into the bucket.']),
    s(['🏖️', 'Go to the beach.'], ['🏰', 'Build a sandcastle.'], ['🌊', 'A wave washes it away.']),
    s(['🖌️', 'Pick up a brush.'], ['🎨', 'Paint a picture.'], ['🖼️', 'Hang it on the wall.']),
    s(['🍳', 'Pour in the batter.'], ['🥞', 'Flip the pancake.'], ['😋', 'Yum!']),
    s(['🐶', 'The puppy is hungry.'], ['🥣', 'Fill its bowl.'], ['💤', 'It eats, then naps.']),
    s(['🧳', 'Pack a suitcase.'], ['✈️', 'Fly on a plane.'], ['🏝️', 'Land on an island.']),
    s(['🌸', 'The tree blossoms.'], ['🍏', 'Little apples grow.'], ['🍎', 'Pick a red apple.']),
    s(['🪁', 'Get the kite.'], ['🏃', 'Run fast!'], ['🌤️', 'The kite flies high.']),
    s(['🎁', 'Wrap a present.'], ['🚪', 'Knock on the door.'], ['🥳', 'Happy birthday!']),
    s(['🛒', 'Fill the trolley.'], ['💳', 'Pay at the till.'], ['🛍️', 'Carry the bags home.']),
    s(['💇', 'Sit in the chair.'], ['✂️', 'Snip, snip!'], ['🪞', 'A new haircut!']),

    s(['🌰', 'Dig a hole and plant a seed.'], ['💧', 'Water it every day.'], ['🌱', 'A green shoot comes up.'], ['🍅', 'Pick the ripe tomatoes.']),
    s(['❄️', 'Snow falls all night.'], ['🧥', 'Put on a warm coat.'], ['🛷', 'Slide down the hill.'], ['☕', 'Warm up with cocoa.']),
    s(['🍞', 'Take two slices of bread.'], ['🧈', 'Spread the butter.'], ['🧀', 'Add some cheese.'], ['😋', 'Take a big bite.']),
    s(['🦷', 'A tooth feels wobbly.'], ['😮', 'It falls out!'], ['🛏️', 'Put it under the pillow.'], ['🪙', 'In the morning there is a coin.']),
    s(['🚏', 'Wait at the bus stop.'], ['🚌', 'The bus arrives.'], ['🎫', 'Show your ticket.'], ['🏫', 'Get off at school.']),
    s(['🐔', 'A hen sits on her eggs.'], ['🥚', 'One egg starts to crack.'], ['🐣', 'A chick pokes its head out.'], ['🐥', 'It runs to its mum.']),
    s(['🚲', 'Ride your bike.'], ['🪨', 'Hit a stone.'], ['🤕', 'Fall and scrape your knee.'], ['🩹', 'Put on a plaster.']),
    s(['👕', 'The shirt is dirty.'], ['🫧', 'Wash it in the machine.'], ['☀️', 'Hang it in the sun.'], ['🧺', 'Fold it and put it away.']),
    s(['🎟️', 'Buy a cinema ticket.'], ['🍿', 'Get some popcorn.'], ['🎬', 'The film starts.'], ['👏', 'Clap at the end.']),
    s(['👩‍🚀', 'Put on a space suit.'], ['🚀', 'Blast off!'], ['🌕', 'Land on the Moon.'], ['🌍', 'Fly back home.']),
    s(['🔥', 'Smoke comes out of a house.'], ['📞', 'Call the fire brigade.'], ['🚒', 'The fire engine races there.'], ['💦', 'They put the fire out.']),
    s(['🪺', 'Birds build a nest.'], ['🥚', 'Mum lays eggs.'], ['🐣', 'The babies hatch.'], ['🕊️', 'They learn to fly.']),
    s(['🫓', 'Roll out the dough.'], ['🍅', 'Spread the tomato sauce.'], ['🧀', 'Sprinkle on cheese.'], ['🍕', 'Bake it and slice it.']),
    s(['🤧', 'Achoo! Achoo!'], ['🤒', 'You have a fever.'], ['🩺', 'The doctor checks you.'], ['😊', 'You feel better.']),
    s(['📚', 'Choose a book.'], ['🪪', 'Show your library card.'], ['📖', 'Read it at home.'], ['↩️', 'Take it back.']),
    s(['🌧️', 'It starts to rain.'], ['☂️', 'Open your umbrella.'], ['💦', 'Jump in the puddles.'], ['🧦', 'Put on dry socks.']),
    s(['🚗', 'The car is muddy.'], ['🧽', 'Soap it all over.'], ['🚿', 'Rinse it off.'], ['✨', 'It sparkles!']),
    s(['⚽', 'Kick off!'], ['🏃', 'Run down the pitch.'], ['🥅', 'Shoot at the goal.'], ['🎉', 'Goal!']),
    s(['🍃', 'Green leaves in summer.'], ['🍂', 'They turn orange in autumn.'], ['🍁', 'They fall to the ground.'], ['🧹', 'Rake them into a pile.']),
    s(['🎫', 'Buy a train ticket.'], ['🚉', 'Wait on the platform.'], ['🚆', 'Get on the train.'], ['👵', 'Hug grandma at the end.']),
    s(['🥛', 'Pour milk into a pan.'], ['🔥', 'Warm it up.'], ['🍫', 'Stir in the chocolate.'], ['☕', 'Sip it slowly.']),
    s(['🩱', 'Put on your swimsuit.'], ['🚿', 'Have a shower first.'], ['🏊', 'Swim a length.'], ['🏅', 'Win a medal.']),
    s(['🏠', 'Visit the animal shelter.'], ['🐕', 'Meet a puppy.'], ['🚗', 'Take it home.'], ['🦮', 'Walk it in the park.']),
    s(['🛍️', 'Buy a present.'], ['🎁', 'Wrap it in paper.'], ['🎀', 'Tie a bow on top.'], ['🥳', 'Give it to a friend.']),
  ],
  hu: [
    s(['🌰', 'Elültetsz egy magot.'], ['🌱', 'Kibújik egy hajtás.'], ['🌻', 'Nagy virág lett!']),
    s(['🥚', 'Itt egy tojás.'], ['🐣', 'Megreped a héja.'], ['🐥', 'Csip-csip, egy csibe!']),
    s(['❄️', 'Esik a hó.'], ['⛄', 'Hóembert építünk.'], ['💧', 'A nap elolvasztja.']),
    s(['🥣', 'Kikevered a tésztát.'], ['🔥', 'Megsütöd a sütőben.'], ['🎂', 'Kész a torta!']),
    s(['🛁', 'Engeded a vizet.'], ['🧽', 'Sikálás, sikálás!'], ['😊', 'Tiszta vagy!']),
    s(['☁️', 'Sötét felhők jönnek.'], ['🌧️', 'Esik az eső.'], ['🌈', 'Szivárvány!']),
    s(['🐛', 'Itt egy kis hernyó.'], ['🍃', 'Sok levelet eszik.'], ['🦋', 'Pillangó lett belőle!']),
    s(['🪥', 'Fogod a fogkefét.'], ['🦷', 'Fogat mosol.'], ['😁', 'Ragyog a fogad!']),
    s(['🎈', 'Felfújod a lufit.'], ['📌', 'Jaj, egy tű!'], ['💥', 'Durr!']),
    s(['🍦', 'Veszel egy fagyit.'], ['☀️', 'Nagyon süt a nap.'], ['💦', 'Elolvad!']),
    s(['⏰', 'Csörög az ébresztő.'], ['🥱', 'Felkelsz és ásítasz.'], ['🥣', 'Megreggelizel.']),
    s(['📖', 'Mesét olvasunk.'], ['💡', 'Lekapcsoljuk a lámpát.'], ['😴', 'Jó éjszakát!']),
    s(['✉️', 'Levelet írsz.'], ['📮', 'Bedobod a postaládába.'], ['📬', 'Megérkezett!']),
    s(['🎣', 'Bedobod a horgot.'], ['🐟', 'Kapás!'], ['🪣', 'Bele a vödörbe.']),
    s(['🏖️', 'Kimész a strandra.'], ['🏰', 'Homokvárat építesz.'], ['🌊', 'Elmossa egy hullám.']),
    s(['🖌️', 'Fogod az ecsetet.'], ['🎨', 'Festesz egy képet.'], ['🖼️', 'Kiteszed a falra.']),
    s(['🍳', 'Kiöntöd a tésztát.'], ['🥞', 'Megfordítod a palacsintát.'], ['😋', 'Nyami!']),
    s(['🐶', 'A kutyus éhes.'], ['🥣', 'Megtöltöd a tálkáját.'], ['💤', 'Evés után alszik.']),
    s(['🧳', 'Bepakolsz a bőröndbe.'], ['✈️', 'Repülővel utazol.'], ['🏝️', 'Leszálltok egy szigeten.']),
    s(['🌸', 'Virágzik a fa.'], ['🍏', 'Kis almák nőnek.'], ['🍎', 'Leszedsz egy piros almát.']),
    s(['🪁', 'Előveszed a sárkányt.'], ['🏃', 'Gyorsan futsz!'], ['🌤️', 'Magasan száll a sárkány.']),
    s(['🎁', 'Becsomagolod az ajándékot.'], ['🚪', 'Bekopogsz az ajtón.'], ['🥳', 'Boldog szülinapot!']),
    s(['🛒', 'Megtöltöd a kosarat.'], ['💳', 'Fizetsz a kasszánál.'], ['🛍️', 'Hazaviszed a szatyrokat.']),
    s(['👢', 'Kitisztítod a csizmádat.'], ['🪟', 'Kiteszed az ablakba.'], ['🍬', 'Reggel tele van!']),

    s(['🌰', 'Lyukat ásol, és elülteted a magot.'], ['💧', 'Minden nap meglocsolod.'], ['🌱', 'Kibújik egy zöld hajtás.'], ['🍅', 'Leszeded a piros paradicsomot.']),
    s(['❄️', 'Egész éjjel esik a hó.'], ['🧥', 'Felveszed a meleg kabátot.'], ['🛷', 'Szánkózol a dombon.'], ['☕', 'Forró kakaóval melegszel.']),
    s(['🍞', 'Fogsz két szelet kenyeret.'], ['🧈', 'Megkened vajjal.'], ['🧀', 'Sajtot teszel rá.'], ['😋', 'Nagyot harapsz.']),
    s(['🦷', 'Mozog az egyik fogad.'], ['😮', 'Kiesett!'], ['🛏️', 'A párnád alá teszed.'], ['🪙', 'Reggel egy pénzérme van ott.']),
    s(['🚏', 'Vársz a buszmegállóban.'], ['🚌', 'Megjön a busz.'], ['🎫', 'Megmutatod a bérletet.'], ['🏫', 'Leszállsz az iskolánál.']),
    s(['🐔', 'A tyúk a tojásain ül.'], ['🥚', 'Az egyik tojás megreped.'], ['🐣', 'Kidugja a fejét egy csibe.'], ['🐥', 'Odaszalad az anyjához.']),
    s(['🚲', 'Biciklizel.'], ['🪨', 'Nekimész egy kőnek.'], ['🤕', 'Elesel, és lehorzsolod a térded.'], ['🩹', 'Ragtapaszt teszel rá.']),
    s(['👕', 'Koszos a póló.'], ['🫧', 'Kimossa a mosógép.'], ['☀️', 'Kiteregeted a napra.'], ['🧺', 'Összehajtod és elteszed.']),
    s(['🎟️', 'Mozijegyet veszel.'], ['🍿', 'Veszel pattogatott kukoricát.'], ['🎬', 'Kezdődik a film.'], ['👏', 'A végén tapsolsz.']),
    s(['👩‍🚀', 'Felveszed az űrruhát.'], ['🚀', 'Kilövés!'], ['🌕', 'Leszállsz a Holdon.'], ['🌍', 'Hazarepülsz a Földre.']),
    s(['🔥', 'Füst jön ki egy házból.'], ['📞', 'Hívod a tűzoltókat.'], ['🚒', 'Száguld a tűzoltóautó.'], ['💦', 'Eloltják a tüzet.']),
    s(['🪺', 'A madarak fészket raknak.'], ['🥚', 'A madármama tojásokat rak.'], ['🐣', 'Kikelnek a fiókák.'], ['🕊️', 'Megtanulnak repülni.']),
    s(['🫓', 'Megkeleszted a lángostésztát.'], ['🔥', 'Kisütöd forró olajban.'], ['🧄', 'Megkened fokhagymával.'], ['😋', 'Tejföllel, sajttal megeszed.']),
    s(['🤧', 'Hapci, hapci!'], ['🤒', 'Lázas vagy.'], ['🩺', 'Megvizsgál az orvos.'], ['😊', 'Újra jól vagy.']),
    s(['📚', 'Választasz egy könyvet.'], ['🪪', 'Megmutatod az olvasójegyet.'], ['📖', 'Otthon elolvasod.'], ['↩️', 'Visszaviszed a könyvtárba.']),
    s(['🌧️', 'Eleredt az eső.'], ['☂️', 'Kinyitod az esernyőt.'], ['💦', 'Pocsolyába ugrálsz.'], ['🧦', 'Otthon száraz zoknit húzol.']),
    s(['🚗', 'Sáros az autó.'], ['🧽', 'Beszappanozod.'], ['🚿', 'Leöblíted.'], ['✨', 'Csillog-villog!']),
    s(['⚽', 'Kezdőrúgás!'], ['🏃', 'Végigfutsz a pályán.'], ['🥅', 'Kapura lősz.'], ['🎉', 'Gól!']),
    s(['🍃', 'Nyáron zöldek a levelek.'], ['🍂', 'Ősszel megsárgulnak.'], ['🍁', 'Lehullanak a földre.'], ['🧹', 'Kupacba gereblyézed őket.']),
    s(['🍇', 'Megérett a szőlő.'], ['✂️', 'Leszüretelitek.'], ['🪣', 'Kádba gyűjtitek.'], ['🧃', 'Finom must lesz belőle.']),
    s(['🥛', 'Tejet öntesz a lábasba.'], ['🔥', 'Megmelegíted.'], ['🍫', 'Belekevered a csokit.'], ['☕', 'Lassan kortyolgatod.']),
    s(['🩱', 'Felveszed a fürdőruhát.'], ['🚿', 'Előbb lezuhanyzol.'], ['🏊', 'Leúszol egy hosszt.'], ['🏅', 'Érmet nyersz.']),
    s(['🏠', 'Elmentek az állatmenhelyre.'], ['🐕', 'Megismertek egy kutyust.'], ['🚗', 'Hazaviszitek.'], ['🦮', 'Sétáltok vele a parkban.']),
    s(['🛍️', 'Veszel egy ajándékot.'], ['🎁', 'Becsomagolod.'], ['🎀', 'Masnit kötsz rá.'], ['🥳', 'Odaadod a barátodnak.']),
  ],
}

export const storiesFor = (list: Story[], level: number) => list.filter((x) => x.minLevel <= level && x.maxLevel >= level)

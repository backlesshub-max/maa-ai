window.buildFunQA = function buildFunQA(){
  const out = [];

  // 50 Greetings
  const greetQs = [
    "hello","hi","hey","good morning","good afternoon","good evening","good night",
    "how are you","how r u","what's up","wassup","are you there","yo","namaste",
    "assalamu alaikum","hola","bonjour","konichiwa","good day","greetings"
  ];
  const greetAs = [
    "Hello! I’m here. Ask me anything from my stored knowledge.",
    "Hi! Type a question and I’ll match it with my knowledge base.",
    "Hey! What would you like to learn today?",
    "Hello! Want climatology, Assam, India, or geography questions?",
    "Hi there! I can answer offline from my datasets."
  ];
  for(let i=0;i<50;i++){
    const q = greetQs[i % greetQs.length] + (i%2===0 ? "" : "!");
    const a = greetAs[i % greetAs.length];
    out.push({ q, a });
  }

  // 50 Interesting
  const interesting = [
    ["Tell me an interesting fact about clouds.","Mammatus clouds look like hanging pouches and often appear after strong thunderstorms."],
    ["Tell me an interesting fact about the atmosphere.","Most weather happens in the troposphere, the lowest atmospheric layer."],
    ["Tell me an interesting fact about rivers.","Meanders can get cut off and form oxbow lakes over time."],
    ["Tell me an interesting fact about deserts.","Many deserts are not always hot—some, like Gobi, can be very cold in winter."],
    ["Tell me an interesting fact about India.","India has extremely diverse climates—from alpine Himalayan zones to tropical coasts."],
    ["Tell me an interesting fact about Assam.","Assam’s Majuli is famous as a river island shaped by the Brahmaputra’s changing channels."],
    ["Tell me an interesting fact about monsoon.","Monsoon is not just rain—it’s a seasonal wind reversal caused by land–sea heating contrast."]
  ];
  for(let i=0;i<50;i++){
    const pair = interesting[i % interesting.length];
    out.push({ q: pair[0] + (i%3===0 ? " please" : ""), a: pair[1] });
  }

  // 50 Impressing / smart chat
  const impressQ = [
    "Teach me something in one line.",
    "Give me a smart tip.",
    "Say something impressive.",
    "Give me a short motivational line.",
    "How can I study better?",
    "How to remember geography facts?",
    "How to revise climatology fast?"
  ];
  const impressA = [
    "Small daily revision beats last-minute stress—consistency is a cheat code.",
    "To remember facts: convert them into questions, then test yourself like a quiz.",
    "If you can explain it simply, you understand it deeply—practice that.",
    "Link new facts to a map, a story, or a cause–effect chain to lock memory.",
    "Use active recall + spaced repetition: short sessions, repeated over days."
  ];
  for(let i=0;i<50;i++){
    out.push({
      q: impressQ[i % impressQ.length],
      a: impressA[i % impressA.length]
    });
  }

  return out;
};

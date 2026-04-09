// You can add new scenarios, but make sure that there is exactly...
// * 1 hackerCard per scenario
// * 3 playerCards per scenario

var scenarios = [
  {
    category: "Network Security",
    hackerCard : {
      description : "I set up a fake Wi-Fi station to steal people’s email and track them online.",
      power : 4,
    },
    playerCards : [
      {
        description : "I never use public wifi networks.",
        power : 5,
        feedback: "✅ Correct! You spotted the scam. Fake Wi-Fi hotspots are designed to steal your data. Avoiding them is the safest bet."
      },
      {
        description : "I browse the web, but I never do any personal business on a public wifi network.",
        power : 3,
        feedback: "⚠️ Partial Success. While safer than logging into bank accounts, hackers can still track your activity on public networks."
      },
      {
        description : "I connect to any wifi network I can use in public.",
        power : 1,
        feedback: "❌ Incorrect. Here's what you missed: Fake Wi-Fi stations can perform 'Man-in-the-Middle' attacks to steal your email and passwords. ✅ What to do instead: Use a VPN or your phone's mobile hotspot."
      }
    ]
  },
  {
    category: "Phishing",
    hackerCard : {
      description : "I sent a fake email from your bank asking for your account details.",
      power : 3,
    },
    playerCards : [
      {
        description : "I checked the email address - the message didn’t come from my bank.",
        power : 5,
        feedback: "✅ Correct! You spotted the scam. Spoofing the sender address is a classic red flag."
      },
      {
        description : "I never give out personal information in response to an email.",
        power : 4,
        feedback: "✅ Correct! Legitimate banks will never ask for sensitive info like PINs or passwords via email."
      },
      {
        description : "I sent the details you asked for so you could check on my account.",
        power : 1,
        feedback: "❌ Incorrect. Here's what you missed: Urgent language and requests for sensitive info are hallmarks of phishing. ✅ What to do instead: Delete the email and call your bank using the official number on your card."
      }
    ]
  },
  {
    category: "Privacy",
    hackerCard : {
      description : "I figured out where you live from all the personal information you share on social media.",
      power : 3,
    },
    playerCards : [
      {
        description : "I never share personal information on my social media accounts.",
        power : 5,
        feedback: "✅ Correct! The less info you share publicly, the harder it is for social engineers to target you."
      },
      {
        description : "I keep my accounts private so only my friends can see them.",
        power : 4,
        feedback: "✅ Correct! Limiting visibility to trusted contacts is a key privacy practice."
      },
      {
        description : "I tag everything so my friends always know what I’m doing.",
        power : 1,
        feedback: "❌ Incorrect. Here's what you missed: Sharing real-time locations and personal details helps hackers build a profile on you. ✅ What to do instead: Post updates after you've left a location and keep private details off-grid."
      }
    ]
  },
  {
    category: "Password Security",
    hackerCard : {
      description : "I watched you type your password and hacked your account.",
      power : 2,
    },
    playerCards : [
      {
        description : "I use different passwords for all of my other accounts.",
        power : 4,
        feedback: "✅ Correct! Using unique passwords ensures that if one account is compromised, the others remain safe."
      },
      {
        description : "I changed my password on all of my accounts because they are the same.",
        power : 2,
        feedback: "⚠️ Good that you changed them, but reusing passwords is a major risk."
      },
      {
        description : "I deleted that account and started a new one. ",
        power : 1,
        feedback: "❌ Incorrect. Here's what you missed: If your password is reused elsewhere, deleting one account won't stop the hacker. ✅ What to do instead: Use a password manager to generate and store unique, complex passwords for every site."
      }
    ]
  },
  {
    category: "Privacy",
    hackerCard : {
      description : "I looked at your browsing history on your phone to see what you do online.",
      power : 2,
    },
    playerCards : [
      {
        description : "I always use a private browser that never keeps my history.",
        power : 4,
        feedback: "✅ Correct! Private browsing/Incognito mode prevents history from being stored on the device."
      },
      {
        description : "I set my browser to delete my history every time I quit. ",
        power : 3,
        feedback: "✅ Correct! Regular cleanup helps maintain your privacy."
      },
      {
        description : "I never clear my browser history because I don’t like typing in big web addresses.",
        power : 1,
        feedback: "❌ Incorrect. Here's what you missed: Your history contains a trail of your online identity and potentially sensitive info. ✅ What to do instead: Use bookmarks for convenience and clear your history frequently."
      }
    ]
  }, 

  {
    category: "Data Protection",
    hackerCard : {
      description : "I hacked your system and all your data is deleted now.",
      power : 2,
    },
    playerCards : [
      {
        description : "I follow the 3-2-1 backup rule. I have on-site as well as off-site location (cloud storage) backup.",
        power : 4,
        feedback: "✅ Correct! Multiple backups in different locations are the best defense against data loss."
      },
      {
        description : "I have my data backed up in local and external hard drive.",
        power : 3,
        feedback: "✅ Correct! Local backups are good, though cloud backups add an extra layer of safety."
      },
      {
        description : "I never backed up my data in any way.",
        power : 1,
        feedback: "❌ Incorrect. Here's what you missed: Data can be lost due to hardware failure, theft, or hacking. ✅ What to do instead: Start backing up your critical files to the cloud or an external drive today."
      }
    ]
  }, 

  {
    category: "Malware",
    hackerCard : {
      description : "I provided you my USB for content transfer.",
      power : 2,
    },
    playerCards : [
      {
        description : "I use Anti-Virus Protection & Firewall to protect my system.",
        power : 4,
        feedback: "✅ Correct! AV software can scan and block malware on external drives before it executes."
      },
      {
        description : "I refused to use your USB as my system was not having Anti-Virus Protection & Firewall.",
        power : 3,
        feedback: "✅ Correct! Not trusting unknown devices is a smart move."
      },
      {
        description : "I used your USB as I am not afraid of my system getting corrupted.",
        power : 1,
        feedback: "❌ Incorrect. Here's what you missed: Malicious USBs can inject keyloggers or ransomware instantly. ✅ What to do instead: Never plug in a device you didn't buy yourself or don't fully trust."
      }
    ]
  }, 
  {
    category: "Malware",
    hackerCard : {
      description : "I will crash your vulnerable system using ransomware attacks, malware and data breaches.",
      power : 2,
    },
    playerCards : [
      {
        description : "You can't because I have turned on Automatic Updates for my operating system.",
        power : 4,
        feedback: "✅ Correct! Updates often include security patches for known vulnerabilities."
      },
      {
        description : "I use web browsers such as Chrome or Firefox that receive frequent, automatic security updates.",
        power : 3,
        feedback: "✅ Correct! Modern browsers are much better at blocking malicious scripts."
      },
      {
        description : "I don't update my softwares nor do I download security updates.",
        power : 1,
        feedback: "❌ Incorrect. Here's what you missed: Hackers exploit known bugs in old software. ✅ What to do instead: Enable automatic updates for all your apps and OS."
      }
    ]
  }
];

// Save original copy for reloading
var originalScenarios = [...scenarios];

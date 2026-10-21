const fs = require('fs');

const pHome = 'c:/Users/JAIMIN/Desktop/JAIMIN-PORTFOLIO/src/pages/Home.tsx';
let dHome = fs.readFileSync(pHome, 'utf8');

if (!dHome.includes('Profile')) {
  dHome = dHome.replace(
    'const Stats = lazy(() => import("../components/Stats"));',
    `const Profile = lazy(() => import("../components/home/Profile"));\nconst Engineering = lazy(() => import("../components/home/Engineering"));\nconst TechStack = lazy(() => import("../components/home/TechStack"));\nconst Approach = lazy(() => import("../components/home/Approach"));\nconst Stats = lazy(() => import("../components/Stats"));`
  );

  dHome = dHome.replace(
    '<ScrollReveal delay={0.1}>\n          <Stats />\n        </ScrollReveal>',
    `<ScrollReveal>\n          <Profile />\n        </ScrollReveal>\n        <ScrollReveal delay={0.1}>\n          <Stats />\n        </ScrollReveal>`
  );

  dHome = dHome.replace(
    '<ScrollReveal>\n          <Capabilities />\n        </ScrollReveal>',
    `<ScrollReveal>\n          <Capabilities />\n        </ScrollReveal>\n        <ScrollReveal>\n          <Engineering />\n        </ScrollReveal>\n        <ScrollReveal>\n          <TechStack />\n        </ScrollReveal>\n        <ScrollReveal>\n          <Approach />\n        </ScrollReveal>`
  );

  fs.writeFileSync(pHome, dHome);
  console.log("Home.tsx updated with new components");
} else {
  console.log("Home.tsx already updated");
}

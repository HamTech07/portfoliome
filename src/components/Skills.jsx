import { motion } from "framer-motion";
import TiltCard from "./TiltCard";
import { skills, techStack } from "../data/content";

const colorMap = {
  blue: { bg: "bg-blue-100", text: "text-blue-600", bar: "bg-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-600", bar: "bg-green-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", bar: "bg-orange-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", bar: "bg-purple-600" },
};

export default function Skills() {
  return (
    <section id="skills" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 100, damping: 16 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold uppercase tracking-widest text-sm">
            What I Do
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-dark mt-2">
            My Skills & Expertise
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((s, i) => {
            const c = colorMap[s.color];
            return (
              <motion.div
                key={s.title}
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 15,
                  delay: i * 0.1,
                }}
              >
                <TiltCard className="skill-card h-full bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    className={`w-14 h-14 ${c.bg} rounded-xl flex items-center justify-center ${c.text} mb-4`}
                  >
                    <i className={`fas ${s.icon} text-2xl`} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-dark mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{s.desc}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.2 }}
                      className={`${c.bar} h-1.5 rounded-full`}
                    />
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* Tech Stack */}
        <div className="mt-20">
          <p className="text-center text-sm uppercase tracking-widest text-gray-400 font-semibold mb-10">
            Technologies I Work With
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {techStack.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ y: 30, opacity: 0, scale: 0.7 }}
                whileInView={{ y: 0, opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                whileHover={{ y: -6, scale: 1.08 }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 14,
                  delay: i * 0.06,
                }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${t.bg} flex items-center justify-center shadow-sm`}
                >
                  <i className={`${t.brand ? "fab" : "fas"} ${t.icon} text-3xl ${t.color}`} />
                </div>
                <span className="text-xs font-medium text-gray-500">{t.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

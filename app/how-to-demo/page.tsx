export default function HowToDemoPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">How to Create Effective Demos</h1>
        <p className="text-muted-foreground">
          A comprehensive guide to creating, delivering, and maintaining demos that drive sales
        </p>
      </div>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Demo Best Practices</h2>
          <div className="space-y-4">
            <p>
              Demos are one of our most powerful sales tools. They allow prospects to experience
              our product's value firsthand, visualize how it fits into their workflow, and build
              confidence in our solution. Follow these best practices to create impactful demos:
            </p>
            
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <h3 className="text-xl font-medium">The 5 Principles of Effective Demos</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>Problem-focused, not feature-focused</strong> - Start with the client's challenges and show how your solution solves them.</li>
                <li><strong>Tailored to the audience</strong> - Customize the demo for the specific client, industry, and use case.</li>
                <li><strong>Concise and clear</strong> - Keep demos focused and avoid overwhelming with unnecessary details.</li>
                <li><strong>Value-driven narrative</strong> - Tell a story that highlights the business value, not just functionality.</li>
                <li><strong>Interactive when possible</strong> - Encourage participation and questions throughout the demo.</li>
              </ol>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Demo Structure</h2>
          <div className="space-y-4">
            <p>
              A well-structured demo follows a logical flow that builds understanding and excitement.
              Here's a proven structure that works for most demos:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-3">1. Introduction (2-3 min)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Briefly recap the client's challenges</li>
                  <li>Connect challenges to your solution</li>
                  <li>Outline what you'll show and the value they'll see</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-3">2. Core Demo (10-15 min)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Focus on 3-5 key capabilities that matter most</li>
                  <li>Use real-world examples relevant to their industry</li>
                  <li>Highlight differentiators from competitors</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-3">3. Q&A (5-10 min)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Address questions about the demo</li>
                  <li>Clarify points of confusion</li>
                  <li>Note any feature requests or special requirements</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-3">4. Next Steps (2-3 min)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Summarize key points and value proposition</li>
                  <li>Suggest concrete next actions</li>
                  <li>Share additional resources or documentation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Enterprise Sales Motion</h2>
          <div className="space-y-4">
            <p>
              For enterprise clients, demos are a critical part of a longer sales process.
              Here's how demos fit into our enterprise sales motion:
            </p>
            
            <div className="bg-card rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Discovery Phase</h3>
                <p>
                  Before scheduling a demo, conduct thorough discovery calls to understand the
                  client's needs, pain points, decision-making process, and technical requirements.
                  Use this information to customize your demo.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Initial Demo</h3>
                <p>
                  The first demo should be high-level, focused on core value propositions and
                  key differentiators. Tailor it to the specific challenges identified during discovery.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Technical Deep Dive</h3>
                <p>
                  For technical stakeholders, prepare detailed demos that address integration,
                  security, architecture, and customization capabilities. Be prepared to answer
                  technical questions.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Proof of Concept</h3>
                <p>
                  For complex sales, offer a limited proof of concept (POC) that allows the
                  client to test the solution with their own data and workflows. Set clear
                  expectations and success criteria.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Executive Presentation</h3>
                <p>
                  For executive decision-makers, prepare a condensed demo focused on business value,
                  ROI, and strategic alignment. Emphasize how the solution addresses their
                  specific business challenges.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Technical Setup Guidelines</h2>
          <div className="space-y-4">
            <p>
              A smoothly running demo environment is essential for a professional impression.
              Follow these guidelines to ensure technical excellence:
            </p>
            
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Stable environments</strong> - Use dedicated demo environments that are regularly tested and updated.</li>
                <li><strong>Realistic data</strong> - Populate demos with realistic (but not real client) data that's relevant to the prospect's industry.</li>
                <li><strong>Backup plans</strong> - Always have a backup demo option (recorded video, alternative access method) in case of technical issues.</li>
                <li><strong>Pre-demo checks</strong> - Test your demo environment, internet connection, and presentation setup 30 minutes before the scheduled demo.</li>
                <li><strong>Clean presentation</strong> - Close unnecessary applications, notifications, and hide desktop icons during screen sharing.</li>
                <li><strong>Security</strong> - Ensure demo environments comply with security standards and don't expose sensitive information.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 
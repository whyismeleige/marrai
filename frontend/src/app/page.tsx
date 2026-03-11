import Link from 'next/link'
import { ArrowRight, Search, TrendingUp, Zap, Sparkles, Target, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-cyan-400/30 blur-lg" />
            </div>
            <span className="text-xl font-bold text-gradient">Marrai</span>
          </div>
          <Link href="/audit">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-0">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          <Badge className="mb-6 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30">
            <Zap className="w-3 h-3 mr-1" />
            AI Search is the Future
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Is Your Business{' '}
            <span className="text-gradient">Invisible to AI?</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover the future of marketing with Marrai. Get powerful AI-powered 
            marketing insights and stay ahead of your competition.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/audit">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-0 text-lg px-8 py-6 animate-pulse-glow">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Results in 2 minutes
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              100% free forever
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            The Problem: AI Search is Replacing Google
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            While you&apos;re optimizing for traditional SEO, your customers are using AI
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card neon-border p-6">
              <CardContent className="pt-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-4 border border-red-500/30">
                  <Search className="h-7 w-7 text-red-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">73% Use AI Search</h3>
                <p className="text-muted-foreground text-sm">
                  B2B buyers use ChatGPT and Perplexity before Google
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card neon-border p-6">
              <CardContent className="pt-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center mb-4 border border-orange-500/30">
                  <TrendingUp className="h-7 w-7 text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Growing Fast</h3>
                <p className="text-muted-foreground text-sm">
                  AI search traffic could surpass Google in 2-4 years
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card neon-border p-6">
              <CardContent className="pt-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center mb-4 border border-green-500/30">
                  <Zap className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Fixable Now</h3>
                <p className="text-muted-foreground text-sm">
                  Answer Engine Optimization ensures you&apos;re recommended
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-5/10" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              What Marrai Offers
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Comprehensive analysis powered by advanced AI
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Target, title: 'AI Visibility Score', desc: 'Comprehensive breakdown of your brand presence in AI' },
                { icon: Cpu, title: 'Marketing Intelligence', desc: 'Deep insights into your market positioning' },
                { icon: Search, title: 'Content Analysis', desc: 'Optimize your content for maximum impact' },
                { icon: Zap, title: 'Actionable Insights', desc: 'Data-driven recommendations for growth' },
                { icon: Sparkles, title: 'Instant Analysis', desc: 'Get results in minutes, not weeks' },
                { icon: TrendingUp, title: 'Growth Roadmap', desc: 'Clear strategy to scale your business' },
              ].map((item, i) => (
                <Card key={i} className="glass-card border-white/10 p-4 hover:border-cyan-500/30 transition-all duration-300">
                  <CardContent className="pt-0 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                      <item.icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/audit">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-0 text-lg px-8 py-6">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-lg font-semibold mb-4">Trusted by businesses optimizing for the future</h3>
          <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                <Zap className="h-4 w-4 text-cyan-400" />
              </div>
              <span>Fast Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                <Search className="h-4 w-4 text-cyan-400" />
              </div>
              <span>Detailed Reports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                <Target className="h-4 w-4 text-cyan-400" />
              </div>
              <span>Actionable Insights</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-2">Built for businesses by a 20-year-old developer</p>
          <p className="text-sm text-muted-foreground/60">Building in public</p>
        </div>
      </footer>
    </div>
  )
}
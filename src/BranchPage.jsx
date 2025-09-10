import { useParams, Link } from "react-router-dom"
import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { MapPin, Phone, Clock, Star, Scissors, Palette, Sparkles, Crown } from "lucide-react"
import BranchNavigation from "./components/BranchNavigation"
import BranchFooter from "./components/BranchFooter"
import { useState, useEffect } from "react"

export default function BranchPage() {
  const { slug } = useParams()
  const branchName = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  const [isVisible, setIsVisible] = useState(false)

  // Fade in animation on component mount
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const services = [
    {
      icon: <Scissors className="w-8 h-8" />,
      title: "Hair Cut & Style",
      description: "Experience our range of cutting-edge styles",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Hair Color",
      description: "Meet our expert team of professional colorists",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Hair Treatment",
      description: "Get our premium hair treatment services",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: "Premium Services",
      description: "Schedule your appointment for exclusive treatments",
      color: "bg-[#160B53] text-white",
    },
  ]

  const popularServices = [
    {
      name: "Hair Cut & Style",
      duration: "45 minutes",
      price: "₱450",
      image: "/hair-cutting-salon-service.png",
    },
    {
      name: "Hair Color",
      duration: "2-3 hours",
      price: "₱2,500",
      image: "/hair-coloring-salon.png",
    },
    {
      name: "Keratin Treatment",
      duration: "2-4 hours",
      price: "₱3,500",
      image: "/keratin-hair-treatment-salon.png",
    },
  ]

  const stylists = [
    {
      name: "Maria Santos",
      specialty: "Color Specialist",
      experience: "8 years",
      rating: 4.9,
      image: "/professional-female-hairstylist.png",
    },
    {
      name: "John Cruz",
      specialty: "Cut & Style",
      experience: "6 years",
      rating: 4.8,
      image: "/male-hairstylist-portrait.png",
    },
    {
      name: "Anna Reyes",
      specialty: "Treatment Expert",
      experience: "10 years",
      rating: 4.9,
      image: "/professional-female-hair-treatment-specialist.png",
    },
  ]

  const testimonials = [
    {
      name: "Maria Gonzales",
      branch: "Makati Branch",
      rating: 5,
      text: "I've been a loyal customer for over 10 years, and the service quality and professionalism across all branches is remarkable. David's Salon truly understands Filipino beauty.",
    },
    {
      name: "Jennifer Santos",
      branch: "BGC Branch",
      rating: 5,
      text: "The staff was not just skilled, they're artists. The transformation was beyond my expectations. The European techniques combined with Filipino hospitality is unmatched!",
    },
    {
      name: "Carlos Mendoza",
      branch: "Cebu Branch",
      rating: 5,
      text: "As someone who travels frequently, I can confidently say that David's Salon offers world-class. The quality is consistent everywhere, and the prices are very reasonable.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Branch Navigation */}
      <BranchNavigation branchName={`${branchName} Branch`} />
      
      {/* Hero Section */}
      <section
        className="relative h-[800px] flex items-center justify-center text-center text-white mt-[122px]"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(22, 11, 83, 0.7)), url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-gwMUdJmDY3pIDaLqR4DsNsL8vwz2Fd.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className={`max-w-4xl px-2 sm:px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="font-bold mb-6 text-balance animate-pulse-slow" style={{ fontSize: '50px' }}>David's Salon {branchName} Branch</h1>
          <p className="text-xl mb-8 text-pretty leading-relaxed">
            Choose your preferred branch to discover our specialized services and exclusive offers tailored just for
            you. Each location offers unique experiences designed for our local community.
          </p>
          <Link to="/">
            <Button 
              size="lg" 
              className="bg-white text-[#160B53] hover:bg-gray-100 font-semibold px-8 py-3"
            >
              Choose another branch
            </Button>
          </Link>
          
          {/* Statistics Cards */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <Card className="p-6 border-0 bg-white" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                <CardContent className="p-0">
                  <div className="text-4xl font-bold text-[#160B53] mb-2">7</div>
                  <div className="text-gray-600">Branches</div>
                </CardContent>
              </Card>
              <Card className="p-6 border-0 bg-white" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                <CardContent className="p-0">
                  <div className="text-4xl font-bold text-[#160B53] mb-2">50K+</div>
                  <div className="text-gray-600">Happy Clients</div>
                </CardContent>
              </Card>
              <Card className="p-6 border-0 bg-white" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                <CardContent className="p-0">
                  <div className="text-4xl font-bold text-[#160B53] mb-2">15+</div>
                  <div className="text-gray-600">Years Experience</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Services Section */}
      <section id="services" className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-center text-[#160B53] mb-4" style={{ fontSize: '50px' }}>Explore Our Services</h2>
          <p className="text-center text-gray-600 mb-12">Discover what makes {branchName} branch special</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="p-6 text-center border-0 transition-shadow" style={{ boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)' }}>
                <CardContent className="p-0">
                  <div
                    className={`w-16 h-16 rounded-full ${service.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#160B53] mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#160B53] text-[#160B53] hover:bg-[#160B53] hover:text-white bg-transparent"
                  >
                    View More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-center text-[#160B53] mb-4" style={{ fontSize: '50px' }}>Popular Services</h2>
          <p className="text-center text-gray-600 mb-12">Our most requested treatments</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularServices.map((service, index) => (
              <Card key={index} className="overflow-hidden border-0 transition-shadow p-0" style={{ boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)' }}>
                <div className="h-48 bg-gray-200">
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#160B53] mb-2">{service.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">{service.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="text-lg font-semibold text-[#160B53]">{service.price}</span>
                  </div>
                  <Button className="w-full bg-[#160B53] hover:bg-[#160B53]/90 text-white">View Service Details</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Top Stylists Section */}
      <section id="stylists" className="py-16 px-6 bg-[#160B53] text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-center mb-4" style={{ fontSize: '50px' }}>Meet Our Top Stylists</h2>
          <p className="text-center mb-12 opacity-90">Expert professionals ready to transform your look</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stylists.map((stylist, index) => (
              <Card key={index} className="bg-white text-gray-900 overflow-hidden border-0 p-0" style={{ boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)' }}>
                <div className="h-64 bg-gray-200">
                  <img
                    src={stylist.image || "/placeholder.svg"}
                    alt={stylist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-[#160B53] mb-1">{stylist.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{stylist.specialty}</p>
                  <p className="text-gray-500 text-xs mb-3">{stylist.experience} experience</p>
                  <div className="flex items-center justify-center mb-4">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-semibold">{stylist.rating}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#160B53] text-[#160B53] hover:bg-[#160B53] hover:text-white bg-transparent"
                  >
                    View Service Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to={`/branch/${slug}/stylists`}>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#160B53] bg-transparent"
              >
                Meet All Stylists
              </Button>
            </Link>
          </div>
                </div>
      </section>

      {/* Our Work Section */}
      <section id="gallery" className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-center text-[#160B53] mb-4" style={{ fontSize: '50px' }}>Our Work</h2>
          <p className="text-center text-gray-600 mb-12">See our work and salon atmosphere</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={`/salon-work-gallery-image-.png?height=300&width=400&query=salon work gallery image ${item}`}
                  alt={`Gallery ${item}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to={`/branch/${slug}/gallery`}>
              <Button className="bg-[#160B53] hover:bg-[#160B53]/90 text-white">View Full Gallery</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-center text-[#160B53] mb-4" style={{ fontSize: '50px' }}>What Our Clients Say</h2>
          <p className="text-center text-gray-600 mb-12">Real stories from our satisfied customers</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="p-6 border-0"
                style={{ 
                  borderColor: '#B5B5B5',
                  boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <CardContent className="p-0">
                  <div className="text-6xl text-[#160B53] mb-4">"</div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#160B53]">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.branch}
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          style={{ animationDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Branch Section */}
      <section className="py-16 px-6 bg-[#160B53] text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-center mb-4" style={{ fontSize: '50px' }}>Visit {branchName} Branch</h2>
          <p className="text-center mb-12 opacity-90">Find us and get in touch</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white text-gray-900 p-6 text-center">
              <CardContent className="p-0">
                <MapPin className="w-8 h-8 text-[#160B53] mx-auto mb-4" />
                <h3 className="font-semibold text-[#160B53] mb-2">Location</h3>
                <p className="text-sm text-gray-600">Ayala Center, Makati</p>
              </CardContent>
            </Card>

            <Card className="bg-white text-gray-900 p-6 text-center">
              <CardContent className="p-0">
                <Phone className="w-8 h-8 text-[#160B53] mx-auto mb-4" />
                <h3 className="font-semibold text-[#160B53] mb-2">Contact</h3>
                <p className="text-sm text-gray-600">+63 930 222 9699</p>
              </CardContent>
            </Card>

            <Card className="bg-white text-gray-900 p-6 text-center">
              <CardContent className="p-0">
                <Clock className="w-8 h-8 text-[#160B53] mx-auto mb-4" />
                <h3 className="font-semibold text-[#160B53] mb-2">Hours</h3>
                <p className="text-sm text-gray-600">Mon-Sun: 10:00 AM - 9:00 PM</p>
              </CardContent>
            </Card>
        </div>
      </div>
      </section>
      
      {/* Footer */}
      <BranchFooter 
        branchName={`${branchName} Branch`}
        branchPhone="+63 930 222 9659"
        branchAddress={`${branchName}, Philippines`}
        branchSlug={slug}
      />
    </div>
  )
}


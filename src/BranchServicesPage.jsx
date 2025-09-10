import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { CTAButton, SecondaryButton } from "./components/ui"
import { Clock, DollarSign, Filter } from "lucide-react"
import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import BranchNavigation from "./components/BranchNavigation"
import BranchFooter from "./components/BranchFooter"

export default function BranchServicesPage() {
  const { slug } = useParams()
  const branchName = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredService, setHoveredService] = useState(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const services = [
    {
      id: 1,
      name: "Hair Cut & Style",
      category: "Cutting & Styling",
      duration: "45-60 min",
      price: "₱350-800",
      tag: "Popular",
      tagColor: "bg-gray-100 text-gray-700",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop",
      description: "Professional hair cutting and styling services"
    },
    {
      id: 2,
      name: "Hair Color",
      category: "Color Services",
      duration: "2-3 hours",
      price: "₱1,200-3,500",
      tag: "Popular",
      tagColor: "bg-gray-100 text-gray-700",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop",
      description: "Expert hair coloring and highlighting services"
    },
    {
      id: 3,
      name: "Keratin Treatment",
      category: "Hair Treatments",
      duration: "3-4 hours",
      price: "₱2,500-4,500",
      tag: "Premium",
      tagColor: "bg-[#160B53] text-white",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
      description: "Deep conditioning keratin treatment for smooth hair"
    },
    {
      id: 4,
      name: "Hair Spa",
      category: "Hair Treatments",
      duration: "60-90 min",
      price: "₱800-1,500",
      tag: "Popular",
      tagColor: "bg-gray-100 text-gray-700",
      image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=300&fit=crop",
      description: "Relaxing hair spa treatment with deep conditioning"
    },
    {
      id: 5,
      name: "Rebonding",
      category: "Hair Treatments",
      duration: "3-4 hours",
      price: "₱1,800-3,200",
      tag: "Popular",
      tagColor: "bg-gray-100 text-gray-700",
      image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop",
      description: "Professional hair rebonding for straight, sleek hair"
    },
    {
      id: 6,
      name: "Highlights",
      category: "Color Services",
      duration: "2-3 hours",
      price: "₱1,500-2,800",
      tag: "",
      tagColor: "",
      image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=300&fit=crop",
      description: "Beautiful hair highlights and lowlights"
    }
  ]

  const categories = ["All", "Cutting & Styling", "Color Services", "Hair Treatments"]

  const filteredServices = services.filter(service => {
    return selectedCategory === "All" || service.category === selectedCategory
  })

  return (
    <>
      {/* Branch Navigation */}
      <BranchNavigation branchName={`${branchName} Branch`} />
      
      {/* Header Section */}
      <section className="py-12 px-6 bg-gray-50 mt-[122px]">
        <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl font-poppins font-bold text-[#160B53] mb-4">Services</h1>
          <p className="text-xl text-gray-600 mb-6">Professional hair and beauty services tailored to your needs</p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-poppins font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-[#160B53] text-white scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:scale-105 border border-gray-200'
                }`}
              >
                {category === "All" && <Filter className="w-4 h-4" />}
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <Card 
                key={service.id}
                className={`overflow-hidden transition-all duration-300 cursor-pointer transform border-0 p-0 ${
                  hoveredService === service.id 
                    ? 'scale-105 ring-2 ring-[#160B53]/20' 
                    : ''
                }`}
                style={{ boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)' }}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
              >
                {/* Service Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      hoveredService === service.id ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  {/* Service Tag */}
                  {service.tag && (
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-poppins font-medium ${service.tagColor}`}>
                      {service.tag}
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-poppins font-medium text-gray-700">
                    {service.category}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className={`text-xl font-poppins font-bold mb-2 transition-colors duration-300 ${
                    hoveredService === service.id ? 'text-[#160B53]' : 'text-gray-900'
                  }`}>
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                  
                  {/* Service Details */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-poppins font-semibold text-[#160B53]">{service.price}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Link to={`/branch/${slug}/services/${service.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 ${
                          hoveredService === service.id ? 'scale-105' : 'scale-100'
                        }`}
                      >
                        View Service Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className={`w-full bg-[#160B53] hover:bg-[#160B53]/90 text-white transition-all duration-300 ${
                        hoveredService === service.id ? 'scale-105' : 'scale-100'
                      }`}
                    >
                      Book This Service
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredServices.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💇‍♀️</div>
              <h3 className="text-xl font-poppins font-semibold text-gray-600 mb-2">No services found</h3>
              <p className="text-gray-500">Try selecting a different category</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-6 bg-[#160B53] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-poppins font-bold mb-4" style={{ fontSize: '50px' }}>Ready to Transform Your Look?</h2>
          <p className="text-xl mb-8 opacity-90">Book your appointment today and experience our professional services</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton className="bg-white text-[#160B53] hover:bg-gray-100">
              Book Appointment
            </CTAButton>
            <SecondaryButton className="border-white text-white hover:bg-white hover:text-[#160B53]">
              Call Us Now
            </SecondaryButton>
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
    </>
  )
}


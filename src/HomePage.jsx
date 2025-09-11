import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { SearchInput } from "./components/ui"
import { MapPin, Phone, Star, Search } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const branchesPerPage = 6

  // Fade in animation on component mount
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const branches = [
    {
      name: "Naga City",
      slug: "naga-city",
      location: "Ayala Center, Makati",
      phone: "+63 930 222 9699",
      image: "/modern-salon-interior.png",
    },
    {
      name: "Marquee Mall",
      slug: "marquee-mall",
      location: "Ayala Center, Makati",
      phone: "+63 930 222 9699",
      image: "/modern-salon-interior.png",
    },
    {
      name: "Guagua",
      slug: "guagua",
      location: "Ayala Center, Makati",
      phone: "+63 930 222 9699",
      image: "/modern-salon-interior.png",
    },
    {
      name: "Waltermart Concepcion Tarlac",
      slug: "waltermart-concepcion-tarlac",
      location: "Ayala Center, Makati",
      phone: "+63 930 222 9699",
      image: "/modern-salon-interior.png",
    },
    {
      name: "Magsaysay Olongapo",
      slug: "magsaysay-olongapo",
      location: "Ayala Center, Makati",
      phone: "+63 930 222 9699",
      image: "/modern-salon-interior.png",
    },
    {
      name: "Harbor Point Ayala",
      slug: "harbor-point-ayala",
      location: "Ayala Center, Makati",
      phone: "+63 930 222 9699",
      image: "/modern-salon-interior.png",
    },
    {
      name: "Waltermart Subic",
      slug: "waltermart-subic",
      location: "Subic Bay, Zambales",
      phone: "+63 930 222 9699",
      image: "/modern-salon-interior.png",
    },
  ]

  const testimonials = [
    {
      name: "Maria Gonzalez",
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

  // Filter branches based on search term
  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredBranches.length / branchesPerPage)
  const startIndex = (currentPage - 1) * branchesPerPage
  const endIndex = startIndex + branchesPerPage
  const currentBranches = filteredBranches.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <>
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
          <h1 className="font-bold mb-6 text-balance animate-pulse-slow" style={{ fontSize: '50px' }}>Welcome to David's Salon</h1>
          <p className="text-xl mb-8 text-pretty leading-relaxed">
            Choose your preferred branch to discover our specialized services and exclusive offers tailored just for
            you. Each location offers unique experiences designed for our local community.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-[#160B53] hover:bg-gray-100 font-semibold px-8 py-3"
            onClick={() => {
              const branchesSection = document.getElementById('branches')
              if (branchesSection) {
                const targetPosition = branchesSection.offsetTop - 20 // Add some offset from top
                const startPosition = window.pageYOffset
                const distance = targetPosition - startPosition
                const duration = 1000 // 1 second for smooth scroll
                let start = null

                const animation = (currentTime) => {
                  if (start === null) start = currentTime
                  const timeElapsed = currentTime - start
                  const run = easeInOutQuad(timeElapsed, startPosition, distance, duration)
                  window.scrollTo(0, run)
                  if (timeElapsed < duration) requestAnimationFrame(animation)
                }

                const easeInOutQuad = (t, b, c, d) => {
                  t /= d / 2
                  if (t < 1) return c / 2 * t * t + b
                  t--
                  return -c / 2 * (t * (t - 2) - 1) + b
                }

                requestAnimationFrame(animation)
              }
            }}
          >
            Select A Branch
          </Button>
        </div>
      </section>

      {/* Promotion Marketing Section */}
      <section className="py-16 px-2 sm:px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-center text-[#160B53] mb-4" style={{ fontSize: '50px' }}>Special New Year Promotions!</h2>
          <p className="text-center text-gray-600 mb-12">Start 2025 with a fresh new look! Limited time offers across all our branches.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Promotion Card 1 */}
            <Card 
              className="p-6 border-0 overflow-hidden" 
              style={{ 
                borderColor: '#B5B5B5',
                boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)'
              }}
            >
              <CardContent className="p-0 text-center">
                <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">
                  50% OFF
                </div>
                <h3 className="text-2xl font-bold text-[#160B53] mb-3">Hair Coloring</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Transform your look with our premium hair coloring services. 
                  Professional stylists, premium products.
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  Valid until March 31, 2025
                </div>
                <Button className="w-full text-white bg-[#160B53] hover:bg-[#160B53]/90">
                  Book Now
                </Button>
              </CardContent>
            </Card>

            {/* Promotion Card 2 */}
            <Card 
              className="p-6 border-0 overflow-hidden" 
              style={{ 
                borderColor: '#B5B5B5',
                boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)'
              }}
            >
              <CardContent className="p-0 text-center">
                <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">
                  FREE
                </div>
                <h3 className="text-2xl font-bold text-[#160B53] mb-3">Hair Treatment</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Get a complimentary hair treatment with any haircut service. 
                  Nourish and protect your hair.
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  With any haircut purchase
                </div>
                <Button className="w-full text-white bg-[#160B53] hover:bg-[#160B53]/90">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Promotion Card 3 */}
            <Card 
              className="p-6 border-0 overflow-hidden" 
              style={{ 
                borderColor: '#B5B5B5',
                boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)'
              }}
            >
              <CardContent className="p-0 text-center">
                <div className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">
                  BUY 2 GET 1
                </div>
                <h3 className="text-2xl font-bold text-[#160B53] mb-3">Styling Products</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Professional hair styling products from top brands. 
                  Buy 2 get 1 free on selected items.
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  While supplies last
                </div>
                <Button className="w-full text-white bg-[#160B53] hover:bg-[#160B53]/90">
                  Shop Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Choose Your Branch Section */}
      <section id="branches" className="py-16 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-bold text-center text-[#160B53] mb-4" style={{ fontSize: '50px' }}>Choose Your Branch</h2>

          <div className="flex justify-center mb-12">
            <div className="max-w-md w-full">
              <SearchInput
                placeholder="Search branch or location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
              />
            </div>
          </div>

          {searchTerm && (
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Found {filteredBranches.length} branch{filteredBranches.length !== 1 ? 'es' : ''} 
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBranches.map((branch, index) => (
              <Card 
                key={index} 
                className="overflow-hidden p-0 border-0"
                style={{ 
                  boxShadow: '0 2px 15px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={branch.image || "/placeholder.svg"}
                    alt={`${branch.name} branch`}
                    className="w-full h-full object-cover"
                    style={{ 
                      objectPosition: 'center center',
                      minHeight: '100%',
                      minWidth: '100%'
                    }}
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    {branch.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">{branch.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">{branch.phone}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      Premium Services
                    </span>
                  </div>
                  <Link to={`/branch/${branch.slug}`}>
                    <Button className="w-full text-white bg-[#160B53] hover:bg-[#160B53]/90">
                      View Services
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-8 h-8 p-0 bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-110 hover:border-[#160B53]/50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {"<"}
              </Button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1
                return (
                  <Button 
                    key={page}
                    variant="outline" 
                    size="sm" 
                    className={`w-8 h-8 p-0 transition-all duration-300 hover:scale-110 ${
                      currentPage === page
                        ? 'bg-[#160B53] text-white border-[#160B53]'
                        : 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-[#160B53]/50'
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-8 h-8 p-0 bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-110 hover:border-[#160B53]/50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {">"}
              </Button>
            </div>
          )}

          {filteredBranches.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No branches found</h3>
              <p className="text-gray-500">
                Try searching with different keywords or check the spelling.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-2 sm:px-4 bg-gray-50">
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

      {/* Call to Action Section */}
      <section className="py-16 px-2 sm:px-4 bg-[#160B53] text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold mb-6" style={{ fontSize: '50px' }}>Ready to Transform Your Look?</h2>
          <p className="text-xl mb-8 text-pretty leading-relaxed">
            Select your preferred branch above to discover our exclusive services and book your appointment today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#160B53] bg-transparent"
              onClick={() => {
                const branchesSection = document.getElementById('branches')
                if (branchesSection) {
                  const targetPosition = branchesSection.offsetTop - 20 // Add some offset from top
                  const startPosition = window.pageYOffset
                  const distance = targetPosition - startPosition
                  const duration = 1000 // 1 second for smooth scroll
                  let start = null

                  const animation = (currentTime) => {
                    if (start === null) start = currentTime
                    const timeElapsed = currentTime - start
                    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration)
                    window.scrollTo(0, run)
                    if (timeElapsed < duration) requestAnimationFrame(animation)
                  }

                  const easeInOutQuad = (t, b, c, d) => {
                    t /= d / 2
                    if (t < 1) return c / 2 * t * t + b
                    t--
                    return -c / 2 * (t * (t - 2) - 1) + b
                  }

                  requestAnimationFrame(animation)
                }
              }}
            >
              Choose Your Branch
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

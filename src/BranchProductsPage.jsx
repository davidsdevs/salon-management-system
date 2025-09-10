import { useState, useEffect } from "react"
import { Search, Filter, Star } from "lucide-react"
import { SearchInput, ConsistentCard, ConsistentCardContent, CTAButton, SecondaryButton } from "./components/ui"
import { useParams } from "react-router-dom"
import BranchNavigation from "./components/BranchNavigation"
import BranchFooter from "./components/BranchFooter"

export default function BranchProductsPage() {
  const { slug } = useParams()
  const branchName = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Branch-specific products - these would be available at this specific branch
  const products = [
    {
      id: 1,
      category: "Hair Care",
      brand: "L'OREAL PROFESSIONAL",
      name: "L'Oreal Professional Serie Expert Absolut Repair Shampoo",
      description: "Reconstructing shampoo for damaged hair - Available at this branch",
      price: "₱1,250",
      originalPrice: "₱1,600",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
      branchExclusive: true
    },
    {
      id: 2,
      category: "Styling Products",
      brand: "WELLA PROFESSIONALS",
      name: "Wella Professionals EIMI Dynamic Fix Hair Spray",
      description: "45-second crafting spray for flexible hold - Branch favorite",
      price: "₱890",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
      branchExclusive: false
    },
    {
      id: 3,
      category: "Hair Color",
      brand: "MATRIX",
      name: "Matrix SoColor Beauty Hair Color",
      description: "Professional permanent hair color - Special branch pricing",
      price: "₱650",
      originalPrice: "₱750",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
      branchExclusive: false
    },
    {
      id: 4,
      category: "Treatments",
      brand: "SCHWARZKOPF",
      name: "Schwarzkopf BC Bonacure Repair Rescue Treatment",
      description: "Deep nourishing treatment for damaged hair - Branch exclusive",
      price: "₱1,450",
      image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=400&fit=crop",
      branchExclusive: true
    },
    {
      id: 5,
      category: "Hair Care",
      brand: "BIOMOD",
      name: "Biomod Hair Care Treatment Booster",
      description: "Professional hair treatment booster - Available only at this branch",
      price: "₱2,490",
      image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop",
      branchExclusive: true
    },
    {
      id: 6,
      category: "Styling Products",
      brand: "L'OREAL PROFESSIONAL",
      name: "L'Oreal Professional Tecni Art Pli Shaping Spray",
      description: "Professional shaping spray for precision styling",
      price: "₱1,150",
      image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=400&fit=crop",
      branchExclusive: false
    },
    {
      id: 7,
      category: "Hair Color",
      brand: "WELLA PROFESSIONALS",
      name: "Wella Professionals Color Touch Plus",
      description: "Semi-permanent hair color with enhanced shine",
      price: "₱1,200",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop",
      branchExclusive: false
    },
    {
      id: 8,
      category: "Treatments",
      brand: "MATRIX",
      name: "Matrix Biolage Advanced Fiberstrong Treatment",
      description: "Advanced treatment for strengthening damaged hair",
      price: "₱1,800",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
      branchExclusive: true
    }
  ]

  const getCategoryColor = (category) => {
    const colors = {
      "Hair Care": "bg-[#160B53]",
      "Styling Products": "bg-[#160B53]",
      "Hair Color": "bg-[#160B53]",
      Treatments: "bg-[#160B53]",
    }
    return colors[category] || "bg-[#160B53]"
  }

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["All", ...new Set(products.map(product => product.category))]

  return (
    <>
      {/* Branch Navigation */}
      <BranchNavigation branchName={`${branchName} Branch`} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-[122px]">
        {/* Page Header */}
        <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="font-poppins font-bold text-[#160B53] mb-6 animate-pulse-slow" style={{ fontSize: '50px' }}>Products Catalog</h1>
          <p className="text-lg text-gray-600 mb-6">Professional hair care products available at {branchName} Branch</p>
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-poppins font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-[#160B53] text-white scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {searchTerm && ` for "${searchTerm}"`}
            </p>
            <div className="flex items-center gap-4">
              <SearchInput
                placeholder="Search products, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 font-poppins"
              />
              <button className="bg-[#160B53] text-white px-4 py-2 rounded-lg font-poppins font-medium hover:bg-[#160B53]/90 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>
        </div>

      {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {filteredProducts.map((product, index) => (
            <ConsistentCard
                key={product.id}
              shadowVariant="custom"
              hoverable={false}
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                  src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                {/* Category Tag */}
                <div
                  className={`absolute top-3 left-3 text-white px-3 py-1 rounded-full text-sm font-poppins font-medium ${getCategoryColor(product.category)}`}
                >
                  {product.category}
                </div>
                
                {/* Branch Exclusive Badge */}
                {product.branchExclusive && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-poppins font-bold">
                    EXCLUSIVE
                  </div>
                )}
                  
                </div>

              {/* Product Info */}
              <ConsistentCardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide mb-1 text-gray-500">
                    {product.brand}
                  </p>
                  <h3 className="font-poppins font-semibold mb-2 line-clamp-2 text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                  {/* Price and Rating */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-poppins font-bold text-[#160B53]">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    
                  {/* Add rating stars for visual appeal */}
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-3 h-3 fill-gray-200 text-gray-200"
                      />
                    ))}
                  </div>
                </div>
              </ConsistentCardContent>
            </ConsistentCard>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-poppins font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2">
          <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="bg-[#160B53] text-white px-4 py-2 rounded-lg font-poppins font-medium">1</button>
          <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-poppins">2</button>
          <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        </main>
        
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


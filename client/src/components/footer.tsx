import { Link } from "wouter";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-rich-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-oxford-orange rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">Buy Sell Prompt</span>
            </div>
            <p className="text-gray-400">
              The world's largest marketplace for premium AI prompts. Create, discover, and monetize AI content.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="w-10 h-10 bg-oxford-blue text-white rounded-lg hover:bg-ut-orange transition-colors">
                <i className="fab fa-twitter"></i>
              </Button>
              <Button variant="ghost" size="icon" className="w-10 h-10 bg-oxford-blue text-white rounded-lg hover:bg-ut-orange transition-colors">
                <i className="fab fa-discord"></i>
              </Button>
              <Button variant="ghost" size="icon" className="w-10 h-10 bg-oxford-blue text-white rounded-lg hover:bg-ut-orange transition-colors">
                <i className="fab fa-github"></i>
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/browse" className="hover:text-ut-orange transition-colors">
                  Browse Prompts
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-ut-orange transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/browse?featured=true" className="hover:text-ut-orange transition-colors">
                  Top Sellers
                </Link>
              </li>
              <li>
                <Link href="/browse?isNew=true" className="hover:text-ut-orange transition-colors">
                  New Releases
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Sellers</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-ut-orange transition-colors">
                  Start Selling
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ut-orange transition-colors">
                  Seller Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ut-orange transition-colors">
                  Best Practices
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ut-orange transition-colors">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-ut-orange transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ut-orange transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ut-orange transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-ut-orange transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Buy Sell Prompt. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Payment Methods:</span>
            <div className="flex space-x-2 text-xl text-gray-400">
              <i className="fab fa-cc-visa"></i>
              <i className="fab fa-cc-mastercard"></i>
              <i className="fab fa-cc-paypal"></i>
              <i className="fab fa-cc-stripe"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

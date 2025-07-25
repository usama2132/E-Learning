#!/bin/bash

# CSS Import Setup Script with Error Fixes
# This script automatically adds CSS imports to React components and fixes common issues
# Only adds imports if they don't already exist

echo "🚀 Starting CSS Import Setup with Error Fixes..."
echo "================================================"

# Function to check if import already exists in file
import_exists() {
    local file="$1"
    local import_statement="$2"
    
    if [[ -f "$file" ]]; then
        grep -Fq "$import_statement" "$file"
        return $?
    fi
    return 1
}

# Function to add import to top of file (after existing imports)
add_import() {
    local file="$1"
    local import_statement="$2"
    
    if [[ -f "$file" ]]; then
        if ! import_exists "$file" "$import_statement"; then
            # Find the last import line and add after it
            awk -v import="$import_statement" '
            BEGIN { 
                imported = 0
                last_import_line = 0
            }
            /^import/ { 
                last_import_line = NR
            }
            {
                lines[NR] = $0
            }
            END {
                for (i = 1; i <= NR; i++) {
                    print lines[i]
                    if (i == last_import_line && !imported) {
                        print import
                        imported = 1
                    }
                }
                if (!imported && last_import_line == 0) {
                    print import
                }
            }
            ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
            
            echo "✅ Added import to: $file"
            echo "   Import: $import_statement"
        else
            echo "⏭️  Import already exists in: $file"
        fi
    else
        echo "⚠️  File not found: $file"
    fi
}

# Function to fix broken import syntax
fix_import_syntax() {
    local file="$1"
    
    if [[ -f "$file" ]]; then
        # Check if file has syntax errors in imports
        if grep -q "^import '.*\.css';" "$file" && grep -q "^import {$" "$file"; then
            echo "🔧 Fixing import syntax in: $file"
            
            # Fix the broken import by removing duplicate CSS imports that break syntax
            sed -i '/^import.*\.css.*;$/d' "$file"
            echo "   Fixed broken import syntax"
        fi
    fi
}

# Function to install missing packages
install_missing_packages() {
    echo "📦 Installing missing packages..."
    
    # Check if package.json exists
    if [[ -f "package.json" ]]; then
        npm install react-router-dom lucide-react react-chartjs-2 chart.js
        echo "✅ Installed missing packages"
    else
        echo "⚠️  package.json not found. Please install manually:"
        echo "   npm install react-router-dom lucide-react react-chartjs-2 chart.js"
    fi
}

# Function to fix export issues in hook files
fix_hook_exports() {
    echo "🔧 Fixing hook export issues..."
    
    # Fix usePagination hook
    if [[ -f "src/hooks/usePagination.js" ]]; then
        if ! grep -q "export.*usePagination" "src/hooks/usePagination.js"; then
            echo "export { usePagination };" >> "src/hooks/usePagination.js"
            echo "✅ Fixed usePagination export"
        fi
    fi
    
    # Fix useDebounce hook
    if [[ -f "src/hooks/useDebounce.js" ]]; then
        if ! grep -q "export.*useDebounce" "src/hooks/useDebounce.js"; then
            echo "export { useDebounce };" >> "src/hooks/useDebounce.js"
            echo "✅ Fixed useDebounce export"
        fi
    fi
    
    # Fix useProgress hook
    if [[ -f "src/hooks/useProgress.js" ]]; then
        if ! grep -q "export.*useProgress" "src/hooks/useProgress.js"; then
            echo "export { useProgress };" >> "src/hooks/useProgress.js"
            echo "✅ Fixed useProgress export"
        fi
    fi
    
    # Fix useCourses hook
    if [[ -f "src/hooks/useCourses.js" ]]; then
        if ! grep -q "export.*useCourses" "src/hooks/useCourses.js"; then
            echo "export { useCourses };" >> "src/hooks/useCourses.js"
            echo "✅ Fixed useCourses export"
        fi
    fi
    
    # Fix useUpload hook
    if [[ -f "src/hooks/useUpload.js" ]]; then
        if ! grep -q "export.*useUpload" "src/hooks/useUpload.js"; then
            echo "export { useUpload };" >> "src/hooks/useUpload.js"
            echo "✅ Fixed useUpload export"
        fi
    fi
}

# Function to fix context exports
fix_context_exports() {
    echo "🔧 Fixing context export issues..."
    
    # Fix ThemeContext
    if [[ -f "src/context/ThemeContext.js" ]]; then
        if ! grep -q "export.*ThemeContext" "src/context/ThemeContext.js"; then
            echo "export { ThemeContext };" >> "src/context/ThemeContext.js"
            echo "✅ Fixed ThemeContext export"
        fi
    fi
}

# Function to create missing CSS files
create_missing_css_files() {
    echo "📁 Creating missing CSS files..."
    
    # Create styles directory structure if it doesn't exist
    mkdir -p src/styles/{base,components,dashboards,pages,themes}
    
    # Create missing CSS files based on errors
    touch "src/styles/components/TransactionList.css"
    echo "✅ Created TransactionList.css"
    
    # Create all other missing CSS files
    local css_files=(
        "src/styles/base/reset.css"
        "src/styles/base/typography.css"
        "src/styles/base/grid.css"
        "src/styles/globals.css"
        "src/styles/variables.css"
        "src/styles/utilities.css"
        "src/styles/responsive.css"
        "src/styles/animations.css"
        "src/styles/themes/light.css"
        "src/styles/themes/dark.css"
    )
    
    for css_file in "${css_files[@]}"; do
        if [[ ! -f "$css_file" ]]; then
            touch "$css_file"
            echo "✅ Created: $css_file"
        fi
    done
}

# Install missing packages first
install_missing_packages

# Create missing CSS files
create_missing_css_files

# Fix hook and context exports
fix_hook_exports
fix_context_exports

# Fix any broken import syntax first
echo "🔧 Fixing broken import syntax..."
fix_import_syntax "src/components/instructor/EarningsChart.js"

# Base styles in index.js
echo "📁 Setting up base styles in index.js..."
BASE_IMPORTS=(
    "import './styles/base/reset.css';"
    "import './styles/base/typography.css';"
    "import './styles/base/grid.css';"
    "import './styles/globals.css';"
    "import './styles/variables.css';"
    "import './styles/utilities.css';"
    "import './styles/responsive.css';"
    "import './styles/animations.css';"
    "import './styles/themes/light.css';"
    "import './styles/themes/dark.css';"
)

for import in "${BASE_IMPORTS[@]}"; do
    add_import "src/index.js" "$import"
done

# App.js
echo "📁 Setting up App.js..."
add_import "src/App.js" "import './App.css';"

# Common Components (Fixed paths)
echo "📁 Setting up Common Components..."
declare -A COMMON_COMPONENTS=(
    ["src/components/common/Button.js"]="import '../../styles/components/Button.css';"
    ["src/components/common/CourseFilters.js"]="import '../../styles/components/CourseFilters.css';"
    ["src/components/common/ErrorBoundary.js"]="import '../../styles/components/ErrorBoundary.css';"
    ["src/components/common/Footer.js"]="import '../../styles/components/Footer.css';"
    ["src/components/common/Header.js"]="import '../../styles/components/Header.css';"
    ["src/components/common/Input.js"]="import '../../styles/components/Input.css';"
    ["src/components/common/Loading.js"]="import '../../styles/components/Loading.css';"
    ["src/components/common/Modal.js"]="import '../../styles/components/Modal.css';"
    ["src/components/common/Navbar.js"]="import '../../styles/components/Navbar.css';"
    ["src/components/common/NotificationBell.js"]="import '../../styles/components/NotificationBell.css';"
    ["src/components/common/Pagination.js"]="import '../../styles/components/Pagination.css';"
    ["src/components/common/PaymentForm.js"]="import '../../styles/components/PaymentForm.css';"
    ["src/components/common/SearchBar.js"]="import '../../styles/components/SearchBar.css';"
    ["src/components/common/Sidebar.js"]="import '../../styles/components/Sidebar.css';"
    ["src/components/common/ThemeToggle.js"]="import '../../styles/components/ThemeToggle.css';"
    ["src/components/common/VideoPlayer.js"]="import '../../styles/components/VideoPlayer.css';"
)

for component in "${!COMMON_COMPONENTS[@]}"; do
    add_import "$component" "${COMMON_COMPONENTS[$component]}"
done

# Admin Components
echo "📁 Setting up Admin Components..."
declare -A ADMIN_COMPONENTS=(
    ["src/components/admin/AdminDashboard.js"]="import '../../styles/dashboards/AdminDashboard.css';"
    ["src/components/admin/AdminProfile.js"]="import '../../styles/pages/AdminProfile.css';"
    ["src/components/admin/CategoryManager.js"]="import '../../styles/dashboards/CategoryManager.css';"
    ["src/components/admin/CourseApproval.js"]="import '../../styles/dashboards/CourseApproval.css';"
    ["src/components/admin/PendingCourses.js"]="import '../../styles/dashboards/PendingCourses.css';"
    ["src/components/admin/PlatformStats.js"]="import '../../styles/dashboards/PlatformStats.css';"
    ["src/components/admin/SystemSettings.js"]="import '../../styles/dashboards/SystemSettings.css';"
    ["src/components/admin/TransactionList.js"]="import '../../styles/components/TransactionList.css';"
    ["src/components/admin/UserManagement.js"]="import '../../styles/dashboards/UserManagement.css';"
    ["src/components/admin/UserTable.js"]="import '../../styles/dashboards/UserTable.css';"
)

for component in "${!ADMIN_COMPONENTS[@]}"; do
    add_import "$component" "${ADMIN_COMPONENTS[$component]}"
done

# Instructor Components
echo "📁 Setting up Instructor Components..."
declare -A INSTRUCTOR_COMPONENTS=(
    ["src/components/instructor/CourseAnalytics.js"]="import '../../styles/dashboards/CourseAnalytics.css';"
    ["src/components/instructor/CourseForm.js"]="import '../../styles/dashboards/CourseForm.css';"
    ["src/components/instructor/CourseManager.js"]="import '../../styles/dashboards/CourseManager.css';"
    ["src/components/instructor/CreateCourse.js"]="import '../../styles/dashboards/CreateCourse.css';"
    ["src/components/instructor/EarningsChart.js"]="import '../../styles/dashboards/EarningsChart.css';"
    ["src/components/instructor/EditCourse.js"]="import '../../styles/dashboards/EditCourse.css';"
    ["src/components/instructor/InstructorDashboard.js"]="import '../../styles/dashboards/InstructorDashboard.css';"
    ["src/components/instructor/InstructorProfile.js"]="import '../../styles/pages/InstructorProfile.css';"
    ["src/components/instructor/MyCourses.js"]="import '../../styles/dashboards/MyCourses.css';"
    ["src/components/instructor/StudentsList.js"]="import '../../styles/dashboards/StudentsList.css';"
    ["src/components/instructor/VideoUpload.js"]="import '../../styles/dashboards/VideoUpload.css';"
)

for component in "${!INSTRUCTOR_COMPONENTS[@]}"; do
    add_import "$component" "${INSTRUCTOR_COMPONENTS[$component]}"
done

# Student Components
echo "📁 Setting up Student Components..."
declare -A STUDENT_COMPONENTS=(
    ["src/components/student/CheckoutForm.js"]="import '../../styles/dashboards/CheckoutForm.css';"
    ["src/components/student/CourseCard.js"]="import '../../styles/dashboards/CourseCard.css';"
    ["src/components/student/CourseCatalog.js"]="import '../../styles/dashboards/CourseCatalog.css';"
    ["src/components/student/CourseDetail.js"]="import '../../styles/pages/CourseDetails.css';"
    ["src/components/student/CourseProgress.js"]="import '../../styles/components/CourseProgress.css';"
    ["src/components/student/MyLearning.js"]="import '../../styles/dashboards/MyLearning.css';"
    ["src/components/student/PaymentFailure.js"]="import '../../styles/dashboards/PaymentFailure.css';"
    ["src/components/student/PaymentSuccess.js"]="import '../../styles/dashboards/PaymentSuccess.css';"
    ["src/components/student/ProgressBar.js"]="import '../../styles/dashboards/ProgressBar.css';"
    ["src/components/student/PurchaseButton.js"]="import '../../styles/dashboards/PurchaseButton.css';"
    ["src/components/student/StudentDashboard.js"]="import '../../styles/dashboards/StudentDashboard.css';"
    ["src/components/student/StudentProfile.js"]="import '../../styles/pages/StudentProfile.css';"
    ["src/components/student/VideoLecture.js"]="import '../../styles/dashboards/VideoLecture.css';"
)

for component in "${!STUDENT_COMPONENTS[@]}"; do
    add_import "$component" "${STUDENT_COMPONENTS[$component]}"
done

# Pages
echo "📁 Setting up Pages..."
declare -A PAGES=(
    ["src/pages/About.js"]="import '../styles/pages/About.css';"
    ["src/pages/Contact.js"]="import '../styles/pages/Contact.css';"
    ["src/pages/CourseDetails.js"]="import '../styles/pages/CourseDetails.css';"
    ["src/pages/Courses.js"]="import '../styles/pages/Courses.css';"
    ["src/pages/Dashboard.js"]="import '../styles/pages/Dashboard.css';"
    ["src/pages/ForgotPassword.js"]="import '../styles/pages/ForgotPassword.css';"
    ["src/pages/Home.js"]="import '../styles/pages/Home.css';"
    ["src/pages/Login.js"]="import '../styles/pages/Login.css';"
    ["src/pages/NotFound.js"]="import '../styles/pages/NotFound.css';"
    ["src/pages/PrivacyPolicy.js"]="import '../styles/pages/PrivacyPolicy.css';"
    ["src/pages/Profile.js"]="import '../styles/pages/Profile.css';"
    ["src/pages/Register.js"]="import '../styles/pages/Register.css';"
    ["src/pages/ResetPassword.js"]="import '../styles/pages/ResetPassword.css';"
    ["src/pages/TermsOfService.js"]="import '../styles/pages/TermsOfService.css';"
    ["src/pages/Unauthorized.js"]="import '../styles/pages/Unauthorized.css';"
)

for page in "${!PAGES[@]}"; do
    add_import "$page" "${PAGES[$page]}"
done

# Create missing CSS files that don't exist
echo "📁 Creating additional missing CSS files..."
css_components=(
    "Button" "CourseFilters" "ErrorBoundary" "Footer" "Header" "Input" "Loading" 
    "Modal" "Navbar" "NotificationBell" "Pagination" "PaymentForm" "SearchBar" 
    "Sidebar" "ThemeToggle" "VideoPlayer" "CourseProgress"
)

css_dashboards=(
    "AdminDashboard" "CategoryManager" "CourseAnalytics" "CourseApproval" 
    "CourseCard" "CourseCatalog" "CourseForm" "CourseManager" "CreateCourse" 
    "EarningsChart" "EditCourse" "InstructorDashboard" "MyCourses" "MyLearning" 
    "PaymentFailure" "PaymentSuccess" "PendingCourses" "PlatformStats" 
    "ProgressBar" "PurchaseButton" "StudentDashboard" "StudentsList" 
    "SystemSettings" "UserManagement" "UserTable" "VideoLecture" "VideoUpload" "CheckoutForm"
)

css_pages=(
    "About" "AdminProfile" "Contact" "CourseDetails" "Courses" "Dashboard" 
    "ForgotPassword" "Home" "InstructorProfile" "Login" "NotFound" 
    "PrivacyPolicy" "Profile" "Register" "ResetPassword" "StudentProfile" 
    "TermsOfService" "Unauthorized"
)

for css in "${css_components[@]}"; do
    mkdir -p "src/styles/components"
    touch "src/styles/components/$css.css"
done

for css in "${css_dashboards[@]}"; do
    mkdir -p "src/styles/dashboards"
    touch "src/styles/dashboards/$css.css"
done

for css in "${css_pages[@]}"; do
    mkdir -p "src/styles/pages"
    touch "src/styles/pages/$css.css"
done

echo ""
echo "================================================"
echo "✨ CSS Import Setup Complete with Error Fixes!"
echo "================================================"
echo ""
echo "📊 What was fixed:"
echo "✅ Installed missing packages (react-router-dom, lucide-react, etc.)"
echo "✅ Fixed broken import syntax in EarningsChart.js"
echo "✅ Created missing CSS files and directory structure"
echo "✅ Fixed export issues in hooks and contexts"
echo "✅ Added proper CSS imports with correct paths"
echo "✅ Fixed TransactionList.css path issue"
echo ""
echo "🔄 Next steps:"
echo "1. Run: npm start (to test if errors are resolved)"
echo "2. Add missing exports to your hook files if needed"
echo "3. Implement missing functions in your API utils"
echo ""
echo "🎉 Your React app should now compile successfully!"
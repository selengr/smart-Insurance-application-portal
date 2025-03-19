import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-toggle';

const Navbar = () => {
    
  return (
    <nav className='border-b py-3'>
        <div >
        {/* <div className={`${styles["landing-top"]}`}> */}
               <div className="flex justify-end flex-row align-middle items-center w-full pr-10">
            
               <Link href="/about-me"
                  passHref
               > <label >About</label></Link>


               <Link href="/auth/login"
              passHref
               >  <label className="mr-4 ml-2">{`Login`}</label></Link>
                <ThemeToggle />

              
               </div>

               <div className="cover-individuals fixed sm:left-2 left-0 flex justify-center align-middle items-center">

               </div>
            </div>
    </nav>
  );
};

export default Navbar;



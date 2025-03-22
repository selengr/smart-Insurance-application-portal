import Link from 'next/link';
import { Locale } from '../../../i18n.config'
import LocaleSwitcher from './locale-switcher'
import { getDictionary } from '@/lib/dictionary'
import { ThemeToggle } from '@/components/theme/theme-toggle';

const Navbar = async ({ lang }: { lang: Locale }) => {
  const { navigation } = await getDictionary(lang)
    
  return (
    <nav className='fixed inset-0 h-16 border-b py-3'>
         <div className='flex items-center justify-between'>
               <div className="flex justify-end flex-row align-middle items-center w-full pr-10">
            
               <Link href={`/${lang}`}
                  passHref
               > <label>{navigation.about}</label></Link>

               <Link href={`/${lang}`}
                       passHref
               >  <label className="mr-4 ml-2">{navigation.home}</label></Link>
                <ThemeToggle />

               </div>

               <div className="cover-individuals fixed sm:left-2 left-0 flex justify-center align-middle items-center">
               <LocaleSwitcher />
               </div>
          </div>
    </nav>
  );
};

export default Navbar;



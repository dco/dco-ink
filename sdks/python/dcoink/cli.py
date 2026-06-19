import argparse
import sys
import dcoink

def main():
    parser = argparse.ArgumentParser(description="dco.ink - Minimalist URL Shortener CLI")
    subparsers = parser.add_subparsers(dest="command")

    # shorten subcommand
    shorten_parser = subparsers.add_parser("shorten", help="Shorten a URL")
    shorten_parser.add_argument("url", help="The long URL to shorten")
    shorten_parser.add_argument("-c", "--code", help="Custom short code (requires API Key)", default=None)
    shorten_parser.add_argument("-k", "--key", help="Your dco.ink API Key (optional for random links)", default=None)
    
    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(1)
    
    try:
        link = dcoink.shorten(url=args.url, custom_code=args.code, api_key=args.key)
        print(f"✅ Success! Your short link is ready:")
        print(f"👉 {link.short_url}")
    except dcoink.errors.DcoApiError as e:
        print(f"❌ API Error: {e.message}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()


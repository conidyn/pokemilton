import sys
from colorama import Fore, Style

# Récupérer les arguments passés par JavaScript
attacker = sys.argv[1]
action = sys.argv[2]
result = sys.argv[3]

# Afficher les messages avec des couleurs
print(Fore.YELLOW + f"{attacker} utilise {action} !" + Style.RESET_ALL)
print(Fore.GREEN + f"Résultat : {result}" + Style.RESET_ALL)

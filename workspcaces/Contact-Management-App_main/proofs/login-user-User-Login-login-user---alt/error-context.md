# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e7]:
    - generic [ref=e8]: Login
    - generic [ref=e9]: Welcome back! Please sign in to your account.
  - generic [ref=e11]:
    - generic [ref=e12]:
      - generic [ref=e14]:
        - generic [ref=e15]:
          - text: Username or Email Address
          - generic [ref=e16]: "*"
        - textbox "Username or Email Address" [ref=e18]:
          - /placeholder: Enter your username or email
      - generic [ref=e21]: Username or email is required
    - generic [ref=e24]:
      - generic [ref=e25]:
        - text: Password
        - generic [ref=e26]: "*"
      - textbox "Password" [active] [ref=e28]:
        - /placeholder: Enter your password
    - generic [ref=e30]:
      - button "Login" [disabled]:
        - generic: Login
    - paragraph [ref=e32]: Don't have an account? Register here
```
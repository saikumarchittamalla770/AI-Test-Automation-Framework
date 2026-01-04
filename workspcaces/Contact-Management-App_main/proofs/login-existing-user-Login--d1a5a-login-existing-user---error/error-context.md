# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e7]:
    - generic [ref=e8]: Login
    - generic [ref=e9]: Welcome back! Please sign in to your account.
  - generic [ref=e11]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - text: Username or Email Address
        - generic [ref=e16]: "*"
      - textbox "Username or Email Address" [ref=e18]:
        - /placeholder: Enter your username or email
        - text: "{{usernameOrEmail}}"
    - generic [ref=e22]:
      - generic [ref=e23]:
        - text: Password
        - generic [ref=e24]: "*"
      - textbox "Password" [ref=e26]:
        - /placeholder: Enter your password
        - text: "{{password}}"
    - button "Login" [active] [ref=e29] [cursor=pointer]:
      - generic [ref=e30]: Login
    - paragraph [ref=e34]: Don't have an account? Register here
```